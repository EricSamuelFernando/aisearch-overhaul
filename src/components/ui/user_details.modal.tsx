export default function AgentDetailModal({ agent, onClose }:{ agent: any; onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Agent Detail</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-black">✖</button>
                </div>

                <div className="text-center">
                    {agent?.profile ? (
                        <img
                            src={agent?.profile}
                            alt="Agent Profile"
                            className="mx-auto w-20 h-20 rounded-full object-cover border"
                        />
                    ) : (
                        <div className="mx-auto w-20 h-20 bg-orange-400 text-white rounded-full flex items-center justify-center text-xl font-bold">
                            {agent?.firstName?.charAt(0)}{agent?.lastName?.charAt(0)}
                        </div>
                    )}

                    <h3 className="text-lg font-bold mt-2">{agent?.firstName} {agent?.lastName}</h3>
                    <p className="text-gray-600">{agent?.email}</p>
                    <p className="text-gray-600 mb-2">📞 {agent?.phone ?? 'N/A'}</p>

                    <div className="text-left mt-4">
                        <p><strong>License Number:</strong> {agent?.licenseNumber ?? 'N/A'}</p>
                        <p className="mt-2"><strong>Description:</strong></p>
                        <p className="text-sm text-gray-700">{agent?.description ?? 'No description provided.'}</p>
                        <p className="text-gray-600 mb-2"><strong>Address:</strong> {agent?.address ?? 'N/A'}</p>
                        <p className="text-gray-600 mb-2"><strong>Bio:</strong> {agent?.bio ?? 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
