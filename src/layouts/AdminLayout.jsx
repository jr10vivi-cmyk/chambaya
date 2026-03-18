import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    LayoutDashboard, Users, Wrench, ShoppingBag, Tag,
    DollarSign, Megaphone, Crown, BarChart3, LogOut, Shield
} from 'lucide-react'

const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/tecnicos', icon: Wrench, label: 'Técnicos' },
    { to: '/admin/clientes', icon: Users, label: 'Clientes' },
    { to: '/admin/servicios', icon: ShoppingBag, label: 'Servicios' },
    { to: '/admin/categorias', icon: Tag, label: 'Categorías' },
    { to: '/admin/ingresos', icon: DollarSign, label: 'Ingresos' },
    { to: '/admin/publicidad', icon: Megaphone, label: 'Publicidad' },
    { to: '/admin/suscripciones', icon: Crown, label: 'Suscripciones' },
    { to: '/admin/reportes', icon: BarChart3, label: 'Reportes' },
]

export default function AdminLayout() {
    const { profile, signOut } = useAuth()
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <aside className="flex flex-col w-64 bg-slate-900 fixed h-full z-30">
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <div className="bg-orange-500 text-white p-2 rounded-xl"><Wrench size={20} /></div>
                        <div>
                            <span className="text-xl font-bold text-white">ChambaYA</span>
                            <div className="flex items-center gap-1 mt-0.5">
                                <Shield size={10} className="text-orange-400" />
                                <span className="text-xs text-orange-400 font-medium">Admin Panel</span>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
                    {navItems.map(({ to, icon: Icon, label, end }) => (
                        <NavLink key={to} to={to} end={end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${isActive
                                    ? 'bg-orange-500 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <Icon size={17} />{label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                            {profile?.nombre?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{profile?.nombre}</p>
                            <p className="text-xs text-slate-400 truncate">Administrador</p>
                        </div>
                    </div>
                    <button onClick={async () => { await signOut(); navigate('/login') }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition">
                        <LogOut size={16} />Cerrar sesión
                    </button>
                </div>
            </aside>

            <main className="flex-1 ml-64 min-h-screen">
                <div className="p-8"><Outlet /></div>
            </main>
        </div>
    )
}