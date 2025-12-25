import Admin from './pages/Admin';
import Analytics from './pages/Analytics';
import Create from './pages/Create';
import Earnings from './pages/Earnings';
import Explore from './pages/Explore';
import Gamification from './pages/Gamification';
import Home from './pages/Home';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import Onboarding from './pages/Onboarding';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "Analytics": Analytics,
    "Create": Create,
    "Earnings": Earnings,
    "Explore": Explore,
    "Gamification": Gamification,
    "Home": Home,
    "Messages": Messages,
    "Profile": Profile,
    "Subscription": Subscription,
    "Onboarding": Onboarding,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};