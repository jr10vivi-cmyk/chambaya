import { Link } from 'react-router-dom'
import { Wrench, ArrowLeft } from 'lucide-react'

export default function Terminos() {
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Términos y Condiciones</h1>
                <p className="text-sm text-gray-400 mb-8">Última actualización: abril 2026</p>

                <div className="space-y-8 text-gray-700 text-sm leading-relaxed">

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Aceptación de los términos</h2>
                        <p>Al registrarte y usar la plataforma ChambaYA, aceptas estos Términos y Condiciones. Si no estás de acuerdo, no debes usar el servicio. ChambaYA se reserva el derecho de modificar estos términos en cualquier momento; los cambios serán notificados por correo electrónico.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Descripción del servicio</h2>
                        <p>ChambaYA es una plataforma digital que conecta a clientes con técnicos independientes (electricistas, gasfiteros, carpinteros, pintores y albañiles) en Ayacucho, Perú. ChambaYA actúa como intermediario y no es empleador de los técnicos registrados.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Registro y cuenta</h2>
                        <p className="mb-2">Para usar ChambaYA debes:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Tener al menos 18 años de edad.</li>
                            <li>Proporcionar información veraz y actualizada.</li>
                            <li>Mantener la confidencialidad de tu contraseña.</li>
                            <li>Notificarnos inmediatamente ante cualquier uso no autorizado de tu cuenta.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Comisiones y pagos</h2>
                        <p className="mb-2">ChambaYA cobra una comisión del <strong>10%</strong> sobre el valor acordado de cada servicio completado. El pago se realiza a través del sistema de custodia integrado con Yape y Plin:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>El cliente deposita el monto al número de ChambaYA antes del inicio del trabajo.</li>
                            <li>El pago queda en custodia hasta que el cliente confirme la conformidad del servicio.</li>
                            <li>El técnico recibe el 90% del monto una vez confirmada la conformidad.</li>
                            <li>En caso de disputa resuelta a favor del cliente, se procede con el reembolso correspondiente.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Obligaciones del técnico</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Presentar documentos de identidad válidos para verificación.</li>
                            <li>Brindar servicios de calidad y dentro de los plazos acordados.</li>
                            <li>No acordar pagos fuera de la plataforma para evadir comisiones.</li>
                            <li>No compartir datos de contacto personal con clientes a través del chat hasta que el servicio sea confirmado.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Obligaciones del cliente</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Describir con precisión el trabajo requerido.</li>
                            <li>Realizar el depósito en custodia antes del inicio del servicio.</li>
                            <li>Confirmar la conformidad del trabajo una vez completado.</li>
                            <li>No solicitar trabajos fuera de la plataforma para evadir el sistema de custodia.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Sistema de disputas</h2>
                        <p>Si existe un desacuerdo entre cliente y técnico, el cliente puede abrir una disputa a través de la plataforma. El equipo de ChambaYA revisará el caso en un plazo de <strong>48 horas hábiles</strong> y tomará la decisión correspondiente, la cual será definitiva.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Verificación de identidad</h2>
                        <p>Los técnicos deben pasar por un proceso de verificación de identidad (DNI + selfie) antes de poder recibir solicitudes. ChambaYA procesará los documentos en un plazo máximo de <strong>48 horas</strong>.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Programa de referidos</h2>
                        <p>ChambaYA puede ofrecer beneficios por referir nuevos usuarios a la plataforma mediante códigos de referido. Los términos específicos de cada promoción serán comunicados oportunamente.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Limitación de responsabilidad</h2>
                        <p>ChambaYA no se hace responsable por la calidad del trabajo realizado por los técnicos, ni por daños directos o indirectos derivados del uso de la plataforma más allá de lo establecido en el sistema de custodia y disputas.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Contacto</h2>
                        <p>Para consultas sobre estos términos, escríbenos a <a href="mailto:soporte@chambaya.pe" className="text-orange-500 hover:underline">soporte@chambaya.pe</a>.</p>
                    </section>
                </div>
            </main>
        </div>
    )
}
