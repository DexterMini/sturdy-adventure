from src.models.user import db
from datetime import datetime
import json

class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    task_type = db.Column(db.String(50), nullable=False)
    parameters = db.Column(db.Text)  # JSON string of task parameters
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, completed, failed
    priority = db.Column(db.Integer, default=1)  # 1=low, 2=medium, 3=high
    result = db.Column(db.Text)  # JSON string of task result
    error_message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    # Foreign keys
    agent_id = db.Column(db.Integer, db.ForeignKey('agents.id'))
    parent_task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'))
    
    # Relationships
    subtasks = db.relationship('Task', backref=db.backref('parent_task', remote_side=[id]), lazy=True)
    
    def __repr__(self):
        return f'<Task {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'task_type': self.task_type,
            'parameters': json.loads(self.parameters) if self.parameters else {},
            'status': self.status,
            'priority': self.priority,
            'result': json.loads(self.result) if self.result else None,
            'error_message': self.error_message,
            'agent_id': self.agent_id,
            'parent_task_id': self.parent_task_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
    
    def set_parameters(self, parameters_dict):
        self.parameters = json.dumps(parameters_dict)
    
    def get_parameters(self):
        return json.loads(self.parameters) if self.parameters else {}
    
    def set_result(self, result_dict):
        self.result = json.dumps(result_dict)
        if self.status == 'completed':
            self.completed_at = datetime.utcnow()
    
    def get_result(self):
        return json.loads(self.result) if self.result else None

