import EditEventTypeForm from "@/app/components/EditEventTypeForm";
import prisma from "@/app/lib/db";
import { notFound } from "next/navigation";

const getData = async (eventTypeId: string) => {
  const data = await prisma.eventType.findUnique({
    where: {
      id: eventTypeId,
    },
    select: {
      title: true,
      description: true,
      duration: true,
      url: true,
      id: true,
      videoCallSoftware: true,
    },
  });

  if (!data) {
    return notFound();
  }

  return data;
};

const EditRoute = async ({ params }: { params: { eventTypeId: string } }) => {
  const { eventTypeId } = params;
  const data = await getData(eventTypeId);

  return (
    <EditEventTypeForm
      callProvider={data.videoCallSoftware}
      description={data.description}
      duration={data.duration}
      title={data.title}
      id={data.id}
      url={data.url}
    />
  );
};

export default EditRoute;
