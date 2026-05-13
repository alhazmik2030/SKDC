import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectFormDialogLazy as ProjectFormDialog } from "@/components/projects/project-form-dialog-lazy";
import { ProjectsList } from "@/components/projects/projects-list";
import { listProjects } from "@/lib/actions/projects";
import { listCustomers } from "@/lib/actions/customers";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, customers] = await Promise.all([listProjects(), listCustomers()]);
  const customerStubs = customers.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div>
      <PageHeader
        eyebrowKey="page.projects.eyebrow"
        titleKey="page.projects.title"
        descriptionKey="page.projects.description"
        action={
          projects.length > 0 ? <ProjectFormDialog customers={customerStubs} /> : undefined
        }
      />

      <ProjectsList projects={projects} customers={customerStubs} />
    </div>
  );
}
