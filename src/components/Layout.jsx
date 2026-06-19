import Sidebar from './Sidebar';
import Topbar from './Topbar';

function Layout({ title, children }) {
  return (
    <div className="flex min-h-screen bg-[#F0F4F8]">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <Topbar title={title} />
        <div className="pt-14 p-6 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;