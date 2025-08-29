import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/toaster';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '../components/ui/alert-dialog';

export default function DesignSamples() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const toast = useToast();
  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      <main id="main-content" className="p-4 md:ml-60 mt-14 space-y-6 text-red-600">
        <section className="space-y-2">
          <h1 className="text-2xl font-semibold">Design Samples</h1>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Buttons</h2>
          <Button className="bg-red-600 hover:bg-red-700 text-white">Primary</Button>
          <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">Secondary</Button>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Inputs</h2>
          <Input className="border-red-600 focus-visible:ring-red-600" placeholder="Sample input" />
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Cards</h2>
          <div className="border border-red-200 rounded p-4">Simple card content</div>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Table Row</h2>
          <table className="min-w-full border border-red-200">
            <thead>
              <tr className="bg-red-50">
                <th className="p-2 border-b border-red-200 text-left">Header</th>
                <th className="p-2 border-b border-red-200 text-left">Header</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-red-200">
                <td className="p-2">Cell 1</td>
                <td className="p-2">Cell 2</td>
              </tr>
            </tbody>
          </table>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Empty State</h2>
          <div className="border border-dashed border-red-200 p-6 text-center">No data available</div>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Toasts</h2>
          <Button onClick={() => toast({ title: 'Toast', description: 'Sample toast message' })} className="bg-red-600 hover:bg-red-700 text-white">
            Show Toast
          </Button>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Modals</h2>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white">Open Modal</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-red-200">
              <AlertDialogHeader>
                <AlertDialogTitle>Modal Title</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </main>
    </>
  );
}