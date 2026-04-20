import { Link } from 'react-router-dom'
import { Wrench, ArrowLeft } from 'lucide-react'

export default function Privacidad() {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link to="/" className="flex items-center gap-2 text-orange-500 hover:text-orange-600 transition">
                        <ArrowLeft size={18} />
                        <span className="text-sm font-medium">Volver</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Wrench size={18} className="text-orange-500" />
                        <span className="font-bold text-gray-900">ChambaYA</span>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidad</h1>
                <p className="text-sm text-gray-400 mb-8">Última actualización: abril 2026</p>

                <div className="space-y-8 text-gray-700 text-sm leading-relaxed">

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Información que recopilamos</h2>
                        <p className="mb-2">Al registrarte y usar ChambaYA recopilamos:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Datos de cuenta:</strong> nombre, apellido, correo electrónico, número de teléfono.</li>
                            <li><strong>Datos de identidad (técnicos):</strong> número de DNI, foto del DNI y selfie de verificación.</li>
                            <li><strong>Datos de ubicación:</strong> coordenadas aproximadas para conectarte con técnicos cercanos.</li>
                            <li><strong>Datos de transacciones:</strong> código de operación Yape/Plin, montos y fechas de pago.</li>
                            <li><strong>Comunicaciones:</strong> mensajes enviados a través del chat de la plataforma.</li>
                            <li><strong>Datos de uso:</strong> páginas visitadas, acciones realizadas e información del dispositivo.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Cómo usamos tu información</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Conectar clientes con técnicos disponibles en su zona.</li>
                            <li>Procesar pagos a través del sistema de custodia.</li>
                            <li>Verificar la identidad de los técnicos registrados.</li>
                            <li>Resolver disputas y atender reclamos.</li>
                            <li>Mejorar nuestros servicios y la experiencia del usuario.</li>
                            <li>Enviarte notificaciones relacionadas con tu cuenta y solicitudes.</li>
                            <li>Cumplir con obligaciones legales aplicables en el Perú.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Compartición de datos</h2>
                        <p className="mb-2">ChambaYA <strong>no vende</strong> tus datos personales. Podemos compartir información en los siguientes casos:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Entre usuarios:</strong> el nombre y calificación del técnico son visibles para los clientes, y viceversa.</li>
                            <li><strong>Proveedores de servicio:</strong> Supabase (base de datos y almacenamiento) bajo acuerdo de confidencialidad.</li>
                            <li><strong>Autoridades:</strong> cuando sea requerido por ley o resolución judicial.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Seguridad de los datos</h2>
                        <p>Implementamos medidas de seguridad técnicas y organizativas para proteger tu información, incluyendo cifrado en tránsito (HTTPS), autenticación segura y control de acceso por roles. Sin embargo, ningún sistema es 100% infalible; te recomendamos usar contraseñas seguras y no compartir tus credenciales.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Retención de datos</h2>
                        <p>Conservamos tus datos mientras tu cuenta esté activa. Al eliminar tu cuenta, los datos personales serán eliminados en un plazo de 30 días, excepto aquellos que debamos conservar por obligación legal (registros contables, resoluciones de disputas).</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Tus derechos</h2>
                        <p className="mb-2">De acuerdo con la Ley N.° 29733 (Ley de Protección de Datos Personales del Perú), tienes derecho a:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Acceder a los datos que tenemos sobre ti.</li>
                            <li>Rectificar datos incorrectos o desactualizados.</li>
                            <li>Solicitar la cancelación de tus datos.</li>
                            <li>Oponerte al tratamiento de tus datos para fines de marketing.</li>
                        </ul>
                        <p className="mt-2">Para ejercer estos derechos, escríbenos a <a href="mailto:privacidad@chambaya.pe" className="text-orange-500 hover:underline">privacidad@chambaya.pe</a>.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Cookies</h2>
                        <p>ChambaYA utiliza cookies técnicas esenciales para el funcionamiento de la sesión. No utilizamos cookies de rastreo publicitario de terceros.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Cambios a esta política</h2>
                        <p>Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos por correo electrónico ante cambios significativos. El uso continuado de la plataforma implica la aceptación de la política vigente.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Contacto</h2>
                        <p>Para consultas sobre privacidad, contáctanos en <a href="mailto:privacidad@chambaya.pe" className="text-orange-500 hover:underline">privacidad@chambaya.pe</a>.</p>
                    </section>
                </div>
            </main>
        </div>
    )
}
