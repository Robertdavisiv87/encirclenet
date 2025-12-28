import Admin from './pages/Admin';
import AdminRevenue from './pages/AdminRevenue';
import Analytics from './pages/Analytics';
import BusinessDashboard from './pages/BusinessDashboard';
import Community from './pages/Community';
import Create from './pages/Create';
import CreateChallenge from './pages/CreateChallenge';
import CreateCircle from './pages/CreateCircle';
import CreateGroup from './pages/CreateGroup';
import CreatorAnalytics from './pages/CreatorAnalytics';
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
import ScheduleQA from './pages/ScheduleQA';
import Search from './pages/Search';
import Settings from './pages/Settings';
import Subscription from './pages/Subscription';
import SystemStatus from './pages/SystemStatus';
import ViewProfile from './pages/ViewProfile';
import Welcome from './pages/Welcome';
import Forums from './pages/Forums';
import Events from './pages/Events';
import ModerationDashboard from './pages/ModerationDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "AdminRevenue": AdminRevenue,
    "Analytics": Analytics,
    "BusinessDashboard": BusinessDashboard,
    "Community": Community,
    "Create": Create,
    "CreateChallenge": CreateChallenge,
    "CreateCircle": CreateCircle,
    "CreateGroup": CreateGroup,
    "CreatorAnalytics": CreatorAnalytics,
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
    "ScheduleQA": ScheduleQA,
    "Search": Search,
    "Settings": Settings,
    "Subscription": Subscription,
    "SystemStatus": SystemStatus,
    "ViewProfile": ViewProfile,
    "Welcome": Welcome,
    "Forums": Forums,
    "Events": Events,
    "ModerationDashboard": ModerationDashboard,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};