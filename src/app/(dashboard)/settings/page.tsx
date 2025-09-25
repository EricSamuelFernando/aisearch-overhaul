import { NotificationsForm } from '@/components/forms/settings/notifications-form';
import { PropertyPreferenceForm } from '@/components/forms/settings/property-preference-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SettingsPage = () => {
  return (
    <main className='mx-auto flex min-h-[90vh] flex-col '>
      <section className='bg-[#F4F9F5] px-12 py-10'>
        <h2 className='text-4xl font-bold'>Settings</h2>
      </section>

      <Tabs defaultValue='property-preference' className='space-y-10 '>
        <TabsList className='h-auto w-full justify-start rounded-none border-b bg-[#F4F9F5] px-12 pb-4 font-medium'>
          <TabsTrigger
            value='property-preference'
            className='rounded-none border-b-2 border-transparent py-2 pl-0 pr-4 font-medium data-[state=active]:border-black data-[state=active]:bg-transparent'
          >
            Property Preference
          </TabsTrigger>
          <TabsTrigger
            value='notifications'
            className='rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-black data-[state=active]:bg-transparent'
          >
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value='property-preference'
          className='!mt-0 flex flex-col px-12'
        >
          <PropertyPreferenceForm />
        </TabsContent>

        <TabsContent value='notifications' className='mt-6 w-full px-12'>
          <NotificationsForm />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default SettingsPage;
