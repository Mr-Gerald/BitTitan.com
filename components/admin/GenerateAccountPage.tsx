import React, { useState, useContext, useRef } from 'react';
import Card from '../shared/Card';
import { AuthContext } from '../auth/AuthContext';
import { Page } from '../../types';

const GenerateAccountPage: React.FC = () => {
    const auth = useContext(AuthContext);
    const [details, setDetails] = useState({
        fullName: '',
        username: '',
        address: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        password: '',
        confirmPassword: '',
    });
    const [avatar, setAvatar] = useState<string>('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDetails({ ...details, [e.target.name]: e.target.value });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatar(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const { confirmPassword, username, ...rest } = details;
        const requiredFields = ['fullName', 'username', 'email', 'phone', 'dateOfBirth', 'password'];
        if (requiredFields.some(field => !(details as any)[field])) {
            setError('All fields except Address are required.');
            return;
        }

        if (details.password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        
        if (!avatar) {
            setError('Please upload a profile picture.');
            return;
        }

        const result = auth?.createDefaultAccount({
            ...rest,
            name: username,
            avatarUrl: avatar,
        });

        if (result) {
            setSuccess(`Successfully created account for ${details.fullName}. Redirecting...`);
            setTimeout(() => {
                auth?.navigateTo(Page.Admin);
            }, 2000);
        } else {
            setError('An account with this username or email already exists.');
        }
    };

    return (
        <div className="p-4 md:p-8">
            <Card className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-white">Generate Instant Default Account</h1>
                <p className="text-basetitan-text-secondary mt-1">Create a new, verified user with pre-loaded transaction history and balances, identical to the 'Gerald' base account.</p>
                
                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    <div className="flex items-center space-x-4">
                        {avatar ? (
                            <img src={avatar} alt="Avatar Preview" className="w-24 h-24 rounded-full border-4 border-basetitan-border object-cover" />
                        ) : (
                            <div className="w-24 h-24 rounded-full border-4 border-basetitan-border bg-basetitan-dark flex items-center justify-center text-basetitan-text-secondary">
                                Avatar
                            </div>
                        )}
                        <div>
                             <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-basetitan-dark hover:bg-basetitan-border text-white font-bold py-2 px-4 rounded-md text-sm">Upload Profile Picture</button>
                             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="text-sm font-semibold text-basetitan-text-secondary">Full Name</label>
                            <input type="text" name="fullName" value={details.fullName} onChange={handleChange} className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                        </div>
                         <div>
                            <label className="text-sm font-semibold text-basetitan-text-secondary">Username</label>
                            <input type="text" name="username" value={details.username} onChange={handleChange} className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                        </div>
                    </div>
                     <div>
                        <label className="text-sm font-semibold text-basetitan-text-secondary">Email Address</label>
                        <input type="email" name="email" value={details.email} onChange={handleChange} className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                    </div>
                     <div>
                        <label className="text-sm font-semibold text-basetitan-text-secondary">Address (Optional)</label>
                        <input type="text" name="address" value={details.address} onChange={handleChange} className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-basetitan-text-secondary">Phone Number</label>
                            <input type="tel" name="phone" value={details.phone} onChange={handleChange} className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-basetitan-text-secondary">Date of Birth</label>
                            <input type="date" name="dateOfBirth" value={details.dateOfBirth} onChange={handleChange} className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-basetitan-text-secondary">Password</label>
                            <input type="password" name="password" value={details.password} onChange={handleChange} className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-basetitan-text-secondary">Confirm Password</label>
                            <input type="password" name="confirmPassword" value={details.confirmPassword} onChange={handleChange} className="mt-1 w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2"/>
                        </div>
                    </div>
                    
                    {error && <p className="text-sm text-accent-danger text-center mt-2">{error}</p>}
                    {success && <p className="text-sm text-accent-secondary text-center mt-2">{success}</p>}

                    <div className="mt-6 flex justify-end space-x-4 pt-4 border-t border-basetitan-border">
                        <button type="button" onClick={() => auth?.navigateTo(Page.Admin)} className="bg-basetitan-dark hover:bg-basetitan-border text-white font-bold py-2 px-6 rounded-md">Cancel</button>
                        <button type="submit" className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 px-6 rounded-md">Generate Account</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default GenerateAccountPage;