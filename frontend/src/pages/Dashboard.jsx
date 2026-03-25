import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import TaskForm from '../components/TaskForm';

function Dashboard() {
  const { token, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, pendingTasks: 0, completionPercentage: 0 });
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  // Error/Success state
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const ArrayEquals = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const statsRes = await axios.get('/api/tasks/analytics', getAuthHeaders());
      setStats(statsRes.data);

      let query = `/api/tasks?page=${page}&limit=10&sortBy=${sortBy}`;
      if (search) query += `&search=${search}`;
      if (statusFilter) query += `&status=${statusFilter}`;
      if (priorityFilter) query += `&priority=${priorityFilter}`;

      const tasksRes = await axios.get(query, getAuthHeaders());
      setTasks(tasksRes.data.tasks);
      setTotalPages(tasksRes.data.pages || 1);
      
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      } else {
        showToast('Failed to fetch data', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
    // eslint-disable-next-line
  }, [page, statusFilter, priorityFilter, sortBy, token]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      if (token) fetchData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line
  }, [search]);

  const handleCreateTask = () => {
    setCurrentTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`/api/tasks/${id}`, getAuthHeaders());
        showToast('Task deleted successfully');
        fetchData();
      } catch (err) {
        showToast('Failed to delete task', 'error');
      }
    }
  };

  const handleMarkDone = async (id) => {
    try {
      await axios.patch(`/api/tasks/${id}/status`, {}, getAuthHeaders());
      showToast('Task marked as done');
      fetchData();
    } catch (err) {
      showToast('Failed to update task', 'error');
    }
  };

  const onModalClose = (shouldRefresh) => {
    setIsModalOpen(false);
    setCurrentTask(null);
    if (shouldRefresh) {
      fetchData();
      showToast(currentTask ? 'Task updated' : 'Task created');
    }
  };

  const chartData = [
    { name: 'Completed', value: stats.completedTasks, color: 'var(--success-color)' },
    { name: 'Pending', value: stats.pendingTasks, color: 'var(--primary-color)' }
  ];

  return (
    <div className="container">
      {toast.show && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        </div>
      )}

      <h2 style={{ marginBottom: '1.5rem' }}>Dashboard Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card text-center">
          <h3>Total Tasks</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{stats.totalTasks}</p>
        </div>
        <div className="card text-center">
          <h3>Pending</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger-color)' }}>{stats.pendingTasks}</p>
        </div>
        <div className="card text-center">
          <h3>Completed</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>{stats.completedTasks}</p>
        </div>
        <div className="card text-center">
          <h3>Completion</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-hover)' }}>{stats.completionPercentage}%</p>
        </div>
      </div>

      <div className="card" style={{ height: '300px', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Task Status Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-muted)" />
            <YAxis stroke="var(--text-muted)" allowDecimals={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', color: 'var(--text-main)', borderRadius: '8px' }} 
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>Your Tasks</h2>
        <button className="btn-primary" onClick={handleCreateTask}>+ Create Task</button>
      </div>

      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <input 
            type="text" 
            placeholder="Search by title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: 0 }}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ marginBottom: 0 }}>
            <option value="">All Statuses</option>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ marginBottom: 0 }}>
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ marginBottom: 0 }}>
            <option value="createdAt">Sort by Date Created</option>
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="spinner-container"><div className="spinner"></div></div>
      ) : tasks.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>No tasks found</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {tasks.map(task => (
            <div key={task._id} className="card" style={{ padding: '1.5rem', marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0 }}>{task.title}</h3>
                  <span style={{ 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.8rem',
                    backgroundColor: task.priority === 'High' ? 'var(--danger-color)' : task.priority === 'Medium' ? 'var(--primary-color)' : '#95a5a6',
                    color: 'white'
                  }}>
                    {task.priority}
                  </span>
                  <span style={{ 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.8rem',
                    border: '1px solid var(--border-color)',
                    color: task.status === 'Done' ? 'var(--success-color)' : 'var(--text-muted)'
                  }}>
                    {task.status}
                  </span>
                </div>
                {task.description && <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{task.description}</p>}
                {task.dueDate && (
                  <p style={{ fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Due: </span> 
                    {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {task.status !== 'Done' && (
                  <button onClick={() => handleMarkDone(task._id)} style={{ background: 'var(--success-color)', color: 'white' }}>✓</button>
                )}
                <button onClick={() => handleEditTask(task)} style={{ background: 'var(--primary-color)', color: 'white' }}>✎</button>
                <button onClick={() => handleDeleteTask(task._id)} className="btn-danger">🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex" style={{ justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', color: page === 1 ? 'var(--text-muted)' : 'var(--text-main)' }}
          >
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center' }}>Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', color: page === totalPages ? 'var(--text-muted)' : 'var(--text-main)' }}
          >
            Next
          </button>
        </div>
      )}

      {isModalOpen && (
        <TaskForm 
          task={currentTask} 
          onClose={onModalClose} 
          token={token} 
        />
      )}
    </div>
  );
}

export default Dashboard;
