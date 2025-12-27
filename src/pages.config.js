import Admin from './pages/Admin';
import AdminRevenue from './pages/AdminRevenue';
import Analytics from './pages/Analytics';
import Create from './pages/Create';
import CreatorEconomy from './pages/CreatorEconomy';
import Earnings from './pages/Earnings';
import Explore from './pages/Explore';
import Gamification from './pages/Gamification';
import Home from './pages/Home';
import Messages from './pages/Messages';
import MyCircle from './pages/MyCircle';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Referrals from './pages/Referrals';
import Settings from './pages/Settings';
import Subscription from './pages/Subscription';
import ViewProfile from './pages/ViewProfile';
import Welcome from './pages/Welcome';
import SystemStatus from './pages/SystemStatus';
import BusinessDashboard from './pages/BusinessDashboard';
import MasterSpec from './pages/MasterSpec';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "AdminRevenue": AdminRevenue,
    "Analytics": Analytics,
    "Create": Create,
    "CreatorEconomy": CreatorEconomy,
    "Earnings": Earnings,
    "Explore": Explore,
    "Gamification": Gamification,
    "Home": Home,
    "Messages": Messages,
    "MyCircle": MyCircle,
    "Onboarding": Onboarding,
    "Profile": Profile,
    "Referrals": Referrals,
    "Settings": Settings,
    "Subscription": Subscription,
    "ViewProfile": ViewProfile,
    "Welcome": Welcome,
    "SystemStatus": SystemStatus,
    "BusinessDashboard": BusinessDashboard,
    "MasterSpec": MasterSpec,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};