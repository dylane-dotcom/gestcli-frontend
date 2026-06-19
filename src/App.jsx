import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardRouter from './pages/DashboardRouter';
import DashboardMedecin from './pages/DashboardMedecin';
import DashboardSecretaire from './pages/DashboardSecretaire';
import DashboardPharmacien from './pages/DashboardPharmacien';
import DashboardInfirmier from './pages/DashboardInfirmier';
import DashboardCaissier from './pages/DashboardCaissier';
import Patients from './pages/Patients';
import RendezVous from './pages/RendezVous';
import Dossier from './pages/Dossier';
import Pharmacie from './pages/Pharmacie';
import Personnel from './pages/Personnel';
import Facturation from './pages/Facturation';
import Services from './pages/Services';
import Parametres from './pages/Parametres';
import Statistiques from './pages/Statistiques';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/router" element={<DashboardRouter />} />
        <Route path="/dashboard/medecin" element={<DashboardMedecin />} />
        <Route path="/dashboard/secretaire" element={<DashboardSecretaire />} />
        <Route path="/dashboard/pharmacien" element={<DashboardPharmacien />} />
        <Route path="/dashboard/infirmier" element={<DashboardInfirmier />} />
        <Route path="/dashboard/caissier" element={<DashboardCaissier />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/rendezvous" element={<RendezVous />} />
        <Route path="/dossier" element={<Dossier />} />
        <Route path="/dossier/:patientId" element={<Dossier />} />
        <Route path="/pharmacie" element={<Pharmacie />} />
        <Route path="/personnel" element={<Personnel />} />
        <Route path="/facturation" element={<Facturation />} />
        <Route path="/services" element={<Services />} />
        <Route path="/parametres" element={<Parametres />} />
        <Route path="/statistiques" element={<Statistiques />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;