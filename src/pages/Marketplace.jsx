import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase, ShoppingBag, FolderOpen } from 'lucide-react';
import ProjectBiddingCard from '../components/marketplace/ProjectBiddingCard';
import ServicePackageBuilder from '../components/marketplace/ServicePackageBuilder';
import PortfolioShowcase from '../components/marketplace/PortfolioShowcase';
import SEO from '../components/SEO';

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState('projects');
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: projects } = useQuery({
    queryKey: ['project-listings'],
    queryFn: () => base44.entities.ProjectListing.filter({ status: 'open' }, '-created_date'),
    initialData: []
  });

  const { data: myServices } = useQuery({
    queryKey: ['my-services', user?.email],
    queryFn: () => base44.entities.FreelanceService.filter({ freelancer_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: myPortfolio } = useQuery({
    queryKey: ['my-portfolio', user?.email],
    queryFn: () => base44.entities.Portfolio.filter({ freelancer_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const handleBid = (project) => {
    // Navigate to bid submission page or open modal
    console.log('Bidding on project:', project);
  };

  const handleViewBids = (project) => {
    // Navigate to bids view
    console.log('Viewing bids for:', project);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to access the marketplace</p>
          <Button onClick={() => base44.auth.redirectToLogin()}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-b from-purple-50 via-white to-pink-50 min-h-screen">
      <SEO 
        title="Marketplace - Encircle Net | Freelance Projects & Services"
        description="Find freelance projects, offer services, and showcase your portfolio on Encircle Net's marketplace. Connect with clients and grow your business."
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Creative Marketplace</h1>
        <p className="text-gray-600">Find projects, offer services, and showcase your work</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Project Bidding
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            My Services
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Portfolio
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-blue-900">Open Projects</h2>
                <p className="text-gray-600">Browse and bid on available projects</p>
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Post Project
              </Button>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-20">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold mb-2 text-gray-700">No Open Projects</h3>
                <p className="text-gray-600">Check back later for new opportunities</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {projects.map(project => (
                  <ProjectBiddingCard
                    key={project.id}
                    project={project}
                    onBid={handleBid}
                    onViewBids={handleViewBids}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-blue-900">Service Packages</h2>
                <p className="text-gray-600">Create tiered packages for your services</p>
              </div>
            </div>

            {myServices.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold mb-2 text-gray-700">No Services Yet</h3>
                <p className="text-gray-600 mb-6">Create your first service to start earning</p>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Service
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {myServices.map(service => (
                  <div key={service.id} className="bg-white rounded-xl p-6 border-2 border-gray-200">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">{service.service_title}</h3>
                    <ServicePackageBuilder
                      serviceId={service.id}
                      existingPackages={[]}
                      onSave={() => {}}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-blue-900">My Portfolio</h2>
              <p className="text-gray-600">Showcase your best work to attract clients</p>
            </div>

            <PortfolioShowcase
              portfolioItems={myPortfolio}
              onAddNew={() => console.log('Add new portfolio item')}
              isOwner={true}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}