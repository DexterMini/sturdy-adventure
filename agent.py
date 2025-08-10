from src.models.user import db
from datetime import datetime
import json

class Agent(db.Model):
    __tablename__ = 'agents'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # text, visual, code, workflow, customer_service, sales
    description = db.Column(db.Text)
    capabilities = db.Column(db.Text)  # JSON string of capabilities
    status = db.Column(db.String(20), default='idle')  # idle, busy, error
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Agent {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'description': self.description,
            'capabilities': json.loads(self.capabilities) if self.capabilities else {},
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def set_capabilities(self, capabilities_dict):
        self.capabilities = json.dumps(capabilities_dict)
    
    def get_capabilities(self):
        return json.loads(self.capabilities) if self.capabilities else {}

