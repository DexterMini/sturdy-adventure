from flask import Blueprint, request, jsonify
from src.models.task import Task, db
from src.models.agent import Agent
import json

orchestrator_bp = Blueprint('orchestrator', __name__)

@orchestrator_bp.route('/orchestrator/analyze', methods=['POST'])
def analyze_request():
    """Analyze a complex request and break it down into tasks"""
    data = request.get_json()
    
    if not data or 'request' not in data:
        return jsonify({'error': 'Request text is required'}), 400
    
    request_text = data['request'].lower()
    
    # Simple rule-based analysis (in real implementation, this would use NLP)
    suggested_tasks = []
    
    # Check for different types of work
    if any(word in request_text for word in ['tekst', 'innhold', 'skrive', 'artikkel', 'e-post']):
        suggested_tasks.append({
            'type': 'text',
            'title': 'Generer tekstinnhold',
            'description': 'Lag tekstbasert innhold basert på forespørselen',
            'priority': 2
        })
    
    if any(word in request_text for word in ['bilde', 'video', 'visuell', 'design', 'logo']):
        suggested_tasks.append({
            'type': 'visual',
            'title': 'Lag visuelt innhold',
            'description': 'Generer bilder eller videoer for kampanjen',
            'priority': 2
        })
    
    if any(word in request_text for word in ['kode', 'automatisering', 'integrasjon', 'api']):
        suggested_tasks.append({
            'type': 'code',
            'title': 'Utvikle kodeløsning',
            'description': 'Implementer teknisk løsning eller integrasjon',
            'priority': 1
        })
    
    if any(word in request_text for word in ['workflow', 'prosess', 'automatiser', 'n8n']):
        suggested_tasks.append({
            'type': 'workflow',
            'title': 'Sett opp workflow',
            'description': 'Konfigurer automatiserte arbeidsflyter',
            'priority': 1
        })
    
    if any(word in request_text for word in ['kunde', 'service', 'support', 'henvendelse']):
        suggested_tasks.append({
            'type': 'customer_service',
            'title': 'Kundeservice oppsett',
            'description': 'Konfigurer AI-drevet kundeservice',
            'priority': 3
        })
    
    if any(word in request_text for word in ['salg', 'leads', 'markedsføring', 'outreach']):
        suggested_tasks.append({
            'type': 'sales',
            'title': 'Salg og markedsføring',
            'description': 'Implementer salgs- og markedsføringsaktiviteter',
            'priority': 3
        })
    
    # If no specific tasks identified, suggest a general coordination task
    if not suggested_tasks:
        suggested_tasks.append({
            'type': 'text',
            'title': 'Analyser forespørsel',
            'description': 'Analyser og planlegg tilnærming til forespørselen',
            'priority': 1
        })
    
    return jsonify({
        'original_request': data['request'],
        'suggested_tasks': suggested_tasks,
        'coordination_strategy': 'Sequential execution with shared context'
    })

@orchestrator_bp.route('/orchestrator/execute-plan', methods=['POST'])
def execute_plan():
    """Execute a coordinated plan with multiple tasks"""
    data = request.get_json()
    
    if not data or 'tasks' not in data:
        return jsonify({'error': 'Tasks list is required'}), 400
    
    created_tasks = []
    
    # Create tasks in the database
    for task_data in data['tasks']:
        task = Task(
            title=task_data['title'],
            description=task_data['description'],
            task_type=task_data['type'],
            priority=task_data.get('priority', 1),
            status='pending'
        )
        
        # Auto-assign agent
        agent = Agent.query.filter_by(type=task_data['type'], status='idle').first()
        if agent:
            task.agent_id = agent.id
            agent.status = 'busy'
        
        db.session.add(task)
        created_tasks.append(task)
    
    db.session.commit()
    
    # Return created tasks
    return jsonify({
        'message': 'Coordinated plan created successfully',
        'tasks': [task.to_dict() for task in created_tasks],
        'total_tasks': len(created_tasks)
    })

@orchestrator_bp.route('/orchestrator/status', methods=['GET'])
def get_orchestrator_status():
    """Get overall system status"""
    # Count agents by status
    agent_stats = db.session.query(
        Agent.status,
        db.func.count(Agent.id)
    ).group_by(Agent.status).all()
    
    # Count tasks by status
    task_stats = db.session.query(
        Task.status,
        db.func.count(Task.id)
    ).group_by(Task.status).all()
    
    # Recent activity
    recent_tasks = Task.query.order_by(Task.updated_at.desc()).limit(5).all()
    
    return jsonify({
        'agent_statistics': {status: count for status, count in agent_stats},
        'task_statistics': {status: count for status, count in task_stats},
        'recent_activity': [task.to_dict() for task in recent_tasks],
        'system_health': 'operational'
    })

@orchestrator_bp.route('/orchestrator/agents/recommend', methods=['POST'])
def recommend_agent():
    """Recommend the best agent for a specific task"""
    data = request.get_json()
    
    if not data or 'task_type' not in data:
        return jsonify({'error': 'Task type is required'}), 400
    
    task_type = data['task_type']
    
    # Find available agents of the right type
    available_agents = Agent.query.filter_by(type=task_type, status='idle').all()
    
    if not available_agents:
        # Find any agent of the right type
        all_agents = Agent.query.filter_by(type=task_type).all()
        return jsonify({
            'recommended_agent': None,
            'available_agents': [agent.to_dict() for agent in all_agents],
            'message': 'No idle agents available for this task type'
        })
    
    # For now, just return the first available agent
    # In a real implementation, this would consider workload, capabilities, etc.
    recommended = available_agents[0]
    
    return jsonify({
        'recommended_agent': recommended.to_dict(),
        'available_agents': [agent.to_dict() for agent in available_agents],
        'recommendation_reason': 'Agent is available and matches task type'
    })

