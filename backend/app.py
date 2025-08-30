from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin # Import cross_origin
from datetime import datetime, timezone
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
# Removed global CORS(app) config - using decorators per route


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    entity_name = db.Column(db.String(100), nullable=False)
    task_type = db.Column(db.String(50), nullable=False)
    task_time = db.Column(db.DateTime, nullable=False)
    contact_person = db.Column(db.String(100), nullable=False)
    note = db.Column(db.Text)
    status = db.Column(db.String(20), default='open')
    # Removed phone_number field as per JD

    def to_dict(self):
        return {
            'id': self.id,
            'date_created': self.date_created.isoformat(),
            'entity_name': self.entity_name,
            'task_type': self.task_type,
            'task_time': self.task_time.isoformat(),
            'contact_person': self.contact_person,
            'note': self.note,
            'status': self.status
            # Removed phone_number from to_dict
        }


with app.app_context():
    db.create_all()


@app.route('/api/tasks', methods=['GET'])
@cross_origin(origin="http://localhost:4200")
def get_tasks():
    # Get filter parameters
    entity_name = request.args.get('entity_name')
    task_type = request.args.get('task_type')
    status = request.args.get('status')
    contact_person = request.args.get('contact_person')
    task_date = request.args.get('task_date')
    search_term = request.args.get('search_term')

    # Debug logging
    print(f"Received filters: entity_name='{entity_name}', task_type='{task_type}', status='{status}', contact_person='{contact_person}', task_date='{task_date}', search_term='{search_term}'")

    query = Task.query

    # Apply filters
    if entity_name and entity_name.strip():
        query = query.filter(Task.entity_name.ilike(f'%{entity_name.strip()}%'))
    if task_type and task_type.strip():
        query = query.filter(Task.task_type == task_type.strip())
    if status and status.strip():
        query = query.filter(Task.status == status.strip())
    if contact_person and contact_person.strip():
        query = query.filter(Task.contact_person.ilike(f'%{contact_person.strip()}%'))
    if task_date and task_date.strip():
        try:
            date_obj = datetime.fromisoformat(task_date.strip() + 'T00:00:00').replace(tzinfo=timezone.utc)
            query = query.filter(db.func.date(Task.task_time) == date_obj.date())
        except ValueError:
            return jsonify({'error': 'Invalid task_date format'}), 400

    if search_term and search_term.strip():
        search_pattern = f'%{search_term.strip()}%'
        query = query.filter(
            (Task.entity_name.ilike(search_pattern)) |
            (Task.task_type.ilike(search_pattern)) |
            (Task.contact_person.ilike(search_pattern)) |
            (Task.note.ilike(search_pattern))
            # Removed phone_number from search
        )

    # Get sort parameters
    sort_by = request.args.get('sort_by', 'date_created')
    sort_order = request.args.get('sort_order', 'desc')

    # Validate sort_by field exists
    if not hasattr(Task, sort_by):
        sort_by = 'date_created'

    if sort_order == 'desc':
        query = query.order_by(getattr(Task, sort_by).desc())
    else:
        query = query.order_by(getattr(Task, sort_by).asc())

    tasks = query.all()
    return jsonify([task.to_dict() for task in tasks])

@app.route('/api/tasks', methods=['POST'])
@cross_origin(origin="http://localhost:4200")
def create_task():
    data = request.json

    # Validate required fields
    required_fields = ['entity_name', 'task_type', 'task_time', 'contact_person']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'{field} is required'}), 400

    try:
        # Ensure task_time is timezone-aware UTC
        task_time = datetime.fromisoformat(data['task_time'].replace('Z', '+00:00'))
        
        # Validate that task time is not in the past
        if task_time < datetime.now(timezone.utc):
            return jsonify({'error': 'Task due time cannot be in the past'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid task_time format'}), 400

    task = Task(
        entity_name=data['entity_name'],
        task_type=data['task_type'],
        task_time=task_time,
        contact_person=data['contact_person'],
        note=data.get('note', ''),
        status='open'
        # Removed phone_number from task creation
    )

    db.session.add(task)
    db.session.commit()

    return jsonify(task.to_dict()), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
@cross_origin(origin="http://localhost:4200")
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.json

    if 'entity_name' in data:
        task.entity_name = data['entity_name']
    if 'task_type' in data:
        task.task_type = data['task_type']
    if 'task_time' in data:
        try:
            # Ensure task_time is timezone-aware UTC
            task_time = datetime.fromisoformat(data['task_time'].replace('Z', '+00:00'))
            if task_time < datetime.now(timezone.utc):
                return jsonify({'error': 'Task due time cannot be in the past'}), 400
            task.task_time = task_time
        except ValueError:
            return jsonify({'error': 'Invalid task_time format'}), 400
    if 'contact_person' in data:
        task.contact_person = data['contact_person']
    if 'note' in data:
        task.note = data['note']
    if 'status' in data:
        if data['status'] not in ['open', 'closed']:
            return jsonify({'error': 'Status must be open or closed'}), 400
        task.status = data['status']
    # Removed phone_number from task update

    db.session.commit()
    return jsonify(task.to_dict())

@app.route('/api/tasks/<int:task_id>/status', methods=['PATCH'])
@cross_origin(origin="http://localhost:4200")
def update_task_status(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.json

    if 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400
    if data['status'] not in ['open', 'closed']:
        return jsonify({'error': 'Status must be open or closed'}), 400

    task.status = data['status']
    db.session.commit()
    return jsonify(task.to_dict())

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
@cross_origin(origin="http://localhost:4200")
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted successfully'})

@app.route('/api/task-types', methods=['GET'])
@cross_origin(origin="http://localhost:4200")
def get_task_types():
    task_types = db.session.query(Task.task_type).distinct().all()
    return jsonify([task_type[0] for task_type in task_types])

@app.route('/api/contact-persons', methods=['GET'])
@cross_origin(origin="http://localhost:4200")
def get_contact_persons():
    contact_persons = db.session.query(Task.contact_person).distinct().all()
    return jsonify([person[0] for person in contact_persons])

if __name__ == '__main__':
    app.run(debug=True, port=5000)
