import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import UsersList from './UsersList.jsx';
import UserForm from './UserForm.jsx';
import HeaderActions from "./HeaderActions.jsx";

export default function UsersPage({onLogout}) {
    const [editingUser, setEditingUser] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const navigate = useNavigate();

    const handleEditUser = (user) => {
        setEditingUser(user);
        setIsCreating(false);
    };

    const handleCreateUser = () => {
        setEditingUser(null);
        setIsCreating(true);
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setIsCreating(false);
    };

    const handleSaveUser = (userData) => {
        console.log('Saved user:', userData);
        setEditingUser(null);
        setIsCreating(false);
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div>
                <HeaderActions onLogout={onLogout}/>
            </div>

            <UsersList onEdit={handleEditUser} onCreate={handleCreateUser}/>

            {(editingUser || isCreating) && (
                <UserForm
                    user={editingUser}
                    onSave={handleSaveUser}
                    onCancel={handleCancelEdit}
                />
            )}
        </div>
    );
}