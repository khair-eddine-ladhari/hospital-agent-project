






import Noaccess from "../pages/auth/Noaccess.tsx";

export default function PrivateRouter({user, children}) {
  
    if (!user) return null;
    if (user.isconnected && user.role === 'admin' ){
      return children;
    } else {
      return <Noaccess />;
    }

  
}
    