import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createTask, deleteTask, getTasks, updateTask } from '../api/tasks.js';

export const TaskContext = createContext(null);

export function useTaskState(token, isAuth) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!isAuth) return;
    setLoading(true);
    setError('');
    try {
      const list = await getTasks(token);
      setTasks(list);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [isAuth, token]);

  useEffect(() => {
    if (isAuth) {
      refresh();
    } else {
      setTasks([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth]);

  async function addTask(taskData) {
    const created = await createTask(taskData, token);
    setTasks((prev) => [...prev, created]);
    return created;
  }

  async function editTask(id, taskData) {
    const updated = await updateTask(id, taskData, token);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }

  async function removeTask(id) {
    await deleteTask(id, token);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function getTaskById(id) {
    return tasks.find((t) => String(t.id) === String(id)) || null;
  }

  return { tasks, loading, error, refresh, addTask, editTask, removeTask, getTaskById };
}

export function useTasks() {
  return useContext(TaskContext);
}
