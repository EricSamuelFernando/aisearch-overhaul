import AddAgentSection from '@/components/dashboard/user/add-agent-section';
import { Metadata } from 'next';

type Props = {};

export const metadata: Metadata = {
  title: 'Add Agent Documents',
  description: 'Add Agent | Snap Homz',
};

function AddAgentPage({}: Props) {
  return <AddAgentSection />;
}

export default AddAgentPage;
