from flask import Blueprint, request, jsonify
from src.models.task import Task, db
from src.models.agent import Agent
from datetime import datetime
import json

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks"""
    tasks = Task.query.order_by(Task.created_at.desc()).all()
    return jsonify([task.to_dict() for task in tasks])

@tasks_bp.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Get a specific task"""
    task = Task.query.get_or_404(task_id)
    return jsonify(task.to_dict())

@tasks_bp.route('/tasks', methods=['POST'])
def create_task():
    """Create a new task"""
    data = request.get_json()
    
    if not data or 'title' not in data or 'task_type' not in data:
        return jsonify({'error': 'Title and task_type are required'}), 400
    
    task = Task(
        title=data['title'],
        description=data.get('description', ''),
        task_type=data['task_type'],
        priority=data.get('priority', 1),
        status='pending'
    )
    
    if 'parameters' in data:
        task.set_parameters(data['parameters'])
    
    # Auto-assign agent based on task type
    if 'agent_id' in data:
        agent = Agent.query.get(data['agent_id'])
        if agent:
            task.agent_id = agent.id
    else:
        # Find available agent of the right type
        agent = Agent.query.filter_by(type=data['task_type'], status='idle').first()
        if agent:
            task.agent_id = agent.id
            agent.status = 'busy'
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify(task.to_dict()), 201

@tasks_bp.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update a task"""
    task = Task.query.get_or_404(task_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'status' in data:
        old_status = task.status
        task.status = data['status']
        
        # Update agent status when task completes
        if old_status != 'completed' and data['status'] == 'completed':
            task.completed_at = datetime.utcnow()
            if task.agent_id:
                agent = Agent.query.get(task.agent_id)
                if agent:
                    agent.status = 'idle'
    
    if 'priority' in data:
        task.priority = data['priority']
    if 'result' in data:
        task.set_result(data['result'])
    if 'error_message' in data:
        task.error_message = data['error_message']
    
    db.session.commit()
    
    return jsonify(task.to_dict())

@tasks_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    task = Task.query.get_or_404(task_id)
    
    # Free up agent if task was assigned
    if task.agent_id and task.status in ['pending', 'in_progress']:
        agent = Agent.query.get(task.agent_id)
        if agent:
            agent.status = 'idle'
    
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({'message': 'Task deleted successfully'})

@tasks_bp.route('/tasks/<int:task_id>/execute', methods=['POST'])
def execute_task(task_id):
    """Execute a task (simulate AI processing)"""
    task = Task.query.get_or_404(task_id)
    
    if task.status != 'pending':
        return jsonify({'error': 'Task is not in pending status'}), 400
    
    # Update task status
    task.status = 'in_progress'
    db.session.commit()
    
    # Simulate task execution based on type
    try:
        result = simulate_task_execution(task)
        task.status = 'completed'
        task.set_result(result)
        task.completed_at = datetime.utcnow()
        
        # Free up agent
        if task.agent_id:
            agent = Agent.query.get(task.agent_id)
            if agent:
                agent.status = 'idle'
        
    except Exception as e:
        task.status = 'failed'
        task.error_message = str(e)
    
    db.session.commit()
    
    return jsonify(task.to_dict())

def simulate_task_execution(task):
    """Simulate AI task execution based on task type"""
    task_type = task.task_type
    parameters = task.get_parameters()
    
    if task_type == 'text':
        return {
            'content': f"Generated text content for: {parameters.get('prompt', 'No prompt provided')}",
            'word_count': 150,
            'language': 'Norwegian'
        }
    elif task_type == 'visual':
        return {
            'image_url': 'https://via.placeholder.com/800x600',
            'format': 'PNG',
            'dimensions': '800x600'
        }
    elif task_type == 'code':
        return {
            'code': '# Generated Python code\nprint("Hello, AI Team!")',
            'language': 'python',
            'lines': 2
        }
    elif task_type == 'workflow':
        return {
            'workflow_id': 'wf_12345',
            'status': 'created',
            'steps': 3
        }
    elif task_type == 'customer_service':
        return {
            'response': 'Thank you for contacting us. How can I help you today?',
            'sentiment': 'positive',
            'confidence': 0.95
        }
    elif task_type == 'sales':
        return {
            'leads_found': 25,
            'emails_sent': 15,
            'response_rate': '12%'
        }
    else:
        return {
            'message': f'Task of type {task_type} completed successfully'
        }

