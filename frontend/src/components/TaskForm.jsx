import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TaskForm({ task, onClose, token }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Todo');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      if (task.dueDate) {
        setDueDate(new Date(task.dueDate).toISOString().split('T')[0]);
      }
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const payload = { title, description, status, priority, dueDate: dueDate || null };

      if (task) {
        await axios.put(`/api/tasks/${task._id}`, payload, config);
      } else {
        await axios.post('/api/tasks', payload, config);
      }

      onClose(true); // Close and refresh
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
      justifyContent: 'center', alignItems: 'center', zIndex: 1000,
      padding: '20px'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>{task ? 'Edit Task' : 'Create Task'}</h2>
          <button onClick={() => onClose(false)} style={{ background: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', padding: 0 }}>&times;</button>
        </div>
        
        {error && <div className="toast error" style={{ position: 'relative', top: 0, right: 0, marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div>
            <label>Title *</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Task title"
              required
            />
          </div>
          
          <div>
            <label>Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Task details..."
              rows="3"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            
            <div>
              <label>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label>Due Date</label>
            <input 
              type="date" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => onClose(false)} style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;
