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
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Referrals from './pages/Referrals';
import Subscription from './pages/Subscription';
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
    "Onboarding": Onboarding,
    "Profile": Profile,
    "Referrals": Referrals,
    "Subscription": Subscription,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};