import { MutableRefObject, useRef, useEffect, useState } from 'react';
import BpmnJS from 'bpmn-js/dist/bpmn-navigated-viewer.development.js';
import { useBpmnContext } from '../contexts/BpmnContext';
import type { BpmnViewerError } from '../types/BpmnViewerError';
import type { BpmnDetails } from '../types/BpmnDetails';

// Wrapper around bpmn-js to Reactify it

const bpmnViewerErrorMap: Record<string, BpmnViewerError> = {
  'no diagram to display': 'noDiagram',
  'no process or collaboration to display': 'noProcess',
};

type UseBpmnViewerResult = {
  canvasRef: MutableRefObject<HTMLDivElement>;
  bpmnViewerError: BpmnViewerError | undefined;
  bpmnDetails: BpmnDetails | undefined;
};

export const useBpmnViewer = (): UseBpmnViewerResult => {
  const { bpmnXml } = useBpmnContext();
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [bpmnViewerError, setBpmnViewerError] = useState<BpmnViewerError | undefined>(undefined);

  const [bpmnDetails, setBpmnDetails] = useState<BpmnDetails>(undefined);

  useEffect(() => {
    if (!canvasRef.current) {
      console.log('Canvas reference is not yet available in the DOM.');
      return;
    }

    const viewer = new BpmnJS({ container: canvasRef.current });

    const eventBus = viewer.get('eventBus');
    const events = ['element.click'];

    events.forEach((event) => {
      eventBus.on(event, (e: any) => {
        const businessObject = e?.element?.businessObject;
        const bpmnId = businessObject?.id;
        const bpmnName = businessObject?.name;
        const bpmnTaskType = businessObject?.extensionElements?.values[0]?.$children[0]?.$body;

        const bpmnDetails: BpmnDetails = {
          id: bpmnId,
          name: bpmnName,
          type: bpmnTaskType,
        };
        // TODO - Not being set properly
        setBpmnDetails(bpmnDetails);
      });
    });

    const initializeViewer = async () => {
      try {
        await viewer.importXML(bpmnXml);
      } catch (exception) {
        setBpmnViewerError(bpmnViewerErrorMap[exception.message] || 'unknown');
      }
    };

    initializeViewer();
  }, [bpmnXml, setBpmnDetails]);

  return { canvasRef, bpmnViewerError, bpmnDetails };
};
