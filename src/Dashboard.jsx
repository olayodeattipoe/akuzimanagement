import { NewDashboard } from "./NewDashboard"

export default function Dashboard({ user, onLogout }) {
    return (
        <div className="flex h-screen">
            <NewDashboard user={user} onLogout={onLogout} />
        </div>
    )
}

