import { NewDashboard } from "./NewDashboard"

export default function Dashboard({ user, onLogout }) {
    return (
        <div className="">
            <NewDashboard user={user} onLogout={onLogout} />
        </div>
    )
}

