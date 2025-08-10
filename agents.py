from flask import Blueprint, request, jsonify
from src.models.agent import Agent, db

agents_bp = Blueprint('agents', __name__)

@agents_bp.route('/agents', methods=['GET'])
def get_agents():
    """Get all agents"""
    agents = Agent.query.all()
    return jsonify([agent.to_dict() for agent in agents])

@agents_bp.route('/agents/<int:agent_id>', methods=['GET'])
def get_agent(agent_id):
    """Get a specific agent"""
    agent = Agent.query.get_or_404(agent_id)
    return jsonify(agent.to_dict())

@agents_bp.route('/agents', methods=['POST'])
def create_agent():
    """Create a new agent"""
    data = request.get_json()
    
    if not data or 'name' not in data or 'type' not in data:
        return jsonify({'error': 'Name and type are required'}), 400
    
    agent = Agent(
        name=data['name'],
        type=data['type'],
        description=data.get('description', ''),
        status=data.get('status', 'idle')
    )
    
    if 'capabilities' in data:
        agent.set_capabilities(data['capabilities'])
    
    db.session.add(agent)
    db.session.commit()
    
    return jsonify(agent.to_dict()), 201

@agents_bp.route('/agents/<int:agent_id>', methods=['PUT'])
def update_agent(agent_id):
    """Update an agent"""
    agent = Agent.query.get_or_404(agent_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    if 'name' in data:
        agent.name = data['name']
    if 'type' in data:
        agent.type = data['type']
    if 'description' in data:
        agent.description = data['description']
    if 'status' in data:
        agent.status = data['status']
    if 'capabilities' in data:
        agent.set_capabilities(data['capabilities'])
    
    db.session.commit()
    
    return jsonify(agent.to_dict())

@agents_bp.route('/agents/<int:agent_id>', methods=['DELETE'])
def delete_agent(agent_id):
    """Delete an agent"""
    agent = Agent.query.get_or_404(agent_id)
    db.session.delete(agent)
    db.session.commit()
    
    return jsonify({'message': 'Agent deleted successfully'})

@agents_bp.route('/agents/types', methods=['GET'])
def get_agent_types():
    """Get available agent types"""
    types = [
        {'value': 'text', 'label': 'Text Generation'},
        {'value': 'visual', 'label': 'Visual Content'},
        {'value': 'code', 'label': 'Code & Integration'},
        {'value': 'workflow', 'label': 'Workflow Orchestration'},
        {'value': 'customer_service', 'label': 'Customer Service'},
        {'value': 'sales', 'label': 'Sales & Marketing'}
    ]
    return jsonify(types)

