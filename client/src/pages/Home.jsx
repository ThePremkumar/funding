import React, { useState, useEffect } from 'react'

import { DisplayCampaigns } from '../components';
import { useStateContext } from '../context'




const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const { address, contract, getCampaigns } = useStateContext();

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const data = await getCampaigns();
  
    // 🔹 Filter out deleted campaigns (owners with 0x000...000 are deleted)
    const activeCampaigns = data.filter(campaign => campaign.owner !== "0x0000000000000000000000000000000000000000");
    
    setCampaigns(activeCampaigns);
    setIsLoading(false);
  };
  
  useEffect(() => {
    if(contract) fetchCampaigns();
  }, [address, contract]);

  return (
    <DisplayCampaigns 
      title="All Campaigns"
      isLoading={isLoading}
      campaigns={campaigns}
    />
  )
}

export default Home