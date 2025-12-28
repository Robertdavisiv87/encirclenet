import Admin from './pages/Admin';
import AdminRevenue from './pages/AdminRevenue';
import Analytics from './pages/Analytics';
import BusinessDashboard from './pages/BusinessDashboard';
import Create from './pages/Create';
import CreatorEconomy from './pages/CreatorEconomy';
import CreatorTools from './pages/CreatorTools';
import Earnings from './pages/Earnings';
import Explore from './pages/Explore';
import Gamification from './pages/Gamification';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import MasterSpec from './pages/MasterSpec';
import Messages from './pages/Messages';
import MyCircle from './pages/MyCircle';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Referrals from './pages/Referrals';
import Settings from './pages/Settings';
import Subscription from './pages/Subscription';
import SystemStatus from './pages/SystemStatus';
import ViewProfile from './pages/ViewProfile';
import Welcome from './pages/Welcome';
import Community from './pages/Community';
import CreateGroup from './pages/CreateGroup';
import CreateCircle from './pages/CreateCircle';
import ScheduleQA from './pages/ScheduleQA';
import CreateChallenge from './pages/CreateChallenge';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "AdminRevenue": AdminRevenue,
    "Analytics": Analytics,
    "BusinessDashboard": BusinessDashboard,
    "Create": Create,
    "CreatorEconomy": CreatorEconomy,
    "CreatorTools": CreatorTools,
    "Earnings": Earnings,
    "Explore": Explore,
    "Gamification": Gamification,
    "Home": Home,
    "Marketplace": Marketplace,
    "MasterSpec": MasterSpec,
    "Messages": Messages,
    "MyCircle": MyCircle,
    "Onboarding": Onboarding,
    "Profile": Profile,
    "Referrals": Referrals,
    "Settings": Settings,
    "Subscription": Subscription,
    "SystemStatus": SystemStatus,
    "ViewProfile": ViewProfile,
    "Welcome": Welcome,
    "Community": Community,
    "CreateGroup": CreateGroup,
    "CreateCircle": CreateCircle,
    "ScheduleQA": ScheduleQA,
    "CreateChallenge": CreateChallenge,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};