import Home from './pages/Home';
import Explore from './pages/Explore';
import Create from './pages/Create';
import Messages from './pages/Messages';
import Earnings from './pages/Earnings';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import Admin from './pages/Admin';
import Analytics from './pages/Analytics';
import Gamification from './pages/Gamification';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Explore": Explore,
    "Create": Create,
    "Messages": Messages,
    "Earnings": Earnings,
    "Profile": Profile,
    "Subscription": Subscription,
    "Admin": Admin,
    "Analytics": Analytics,
    "Gamification": Gamification,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};