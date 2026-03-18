import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Search, ClipboardList, MessageCircle, History, LogOut, Wrench, Bell } from 'lucide-react'
import { useState } from 'react'
import { useNoLeidos } from '../hooks/useChat'

const navItems = [
    { to: '/cliente', icon: Search, label: 'Buscar', end: true },
    { to: '/cliente/solicitudes', icon: ClipboardList, label: 'Solicitudes' },
    { to: '/cliente/chat', icon: MessageCircle, label: 'Chat' },
    { to: '/cliente/historial', icon: History, label: 'Historial' },
]

export default function ClienteLayout() {
    const { profile, signOut } = useAuth()
    const navigate = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false) 
    const { noLeidos } = useNoLeidos()

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* Sidebar desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed h-full z-30">
                {/* Logo */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="bg-orange-500 text-white p-2 rounded-xl">
                            <Wrench size={20} />
                        </div>
                        <span className="text-xl font-bold text-gray-900">ChambaYA</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ to, icon: Icon, label, end }) => (
                        <NavLink
                            key={to} to={to} end={end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${isActive
                                    ? 'bg-orange-50 text-orange-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            <Icon size={18} />
                            {label}
                            {to.includes('/chat') && noLeidos > 0 && (
                                <span className="ml-auto bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {noLeidos > 9 ? '9+' : noLeidos}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Usuario */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-sm">
                            {profile?.nombre?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{profile?.nombre} {profile?.apellido}</p>
                            <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                    >
                        <LogOut size={16} />
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Contenido principal */}
            <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Header móvil */}
                <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-20">
                    <div className="flex items-center gap-2">
                        <div className="bg-orange-500 text-white p-1.5 rounded-lg"><Wrench size={16} /></div>
                        <span className="font-bold text-gray-900">ChambaYA</span>
                    </div>
                    <button onClick={() => setMobileOpen(v => !v)} className="p-2 rounded-lg hover:bg-gray-100">
                        <div className="space-y-1">
                            <div className="w-5 h-0.5 bg-gray-600" />
                            <div className="w-5 h-0.5 bg-gray-600" />
                            <div className="w-5 h-0.5 bg-gray-600" />
                        </div>
                    </button>
                </header>

                <div className="flex-1 p-4 md:p-8">
                    <Outlet />
                </div>
            </main>

            {/* Nav móvil inferior */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-30">
                {navItems.map(({ to, icon: Icon, label, end }) => (
                    <NavLink
                        key={to} to={to} end={end}
                        className={({ isActive }) =>
                            `flex-1 flex flex-col items-center gap-1 py-3 text-xs transition ${isActive ? 'text-orange-500' : 'text-gray-400'
                            }`
                        }
                    >
                        <div className="relative">
                            <Icon size={20} />
                            {to.includes('/chat') && noLeidos > 0 && (
                                <span className="absolute -top-1 -right-2.5 bg-orange-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                                    {noLeidos > 9 ? '9+' : noLeidos}
                                </span>
                            )}
                        </div>
                        {label}
                    </NavLink>
                              
                ))}
            </nav>
        </div>
    )
}