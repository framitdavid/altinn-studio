import type { MutableRefObject } from 'react';
import { useRef, useEffect } from 'react';
import type BpmnModeler from 'bpmn-js/lib/Modeler';
import { useBpmnContext } from '../contexts/BpmnContext';
import { useBpmnModeler } from './useBpmnModeler';
import { getBpmnEditorDetailsFromBusinessObject } from '../utils/hookUtils';

// Wrapper around bpmn-js to Reactify it

type UseBpmnViewerResult = {
  canvasRef: MutableRefObject<HTMLDivElement>;
  modelerRef: MutableRefObject<BpmnModeler>;
};

export const useBpmnEditor = (): UseBpmnViewerResult => {
  const { bpmnXml, modelerRef, setNumberOfUnsavedChanges, setBpmnDetails } = useBpmnContext();
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const { getModeler } = useBpmnModeler();

  useEffect(() => {
    if (!canvasRef.current) {
      console.log('Canvas reference is not yet available in the DOM.');
      return;
    }
    const modelerInstance: BpmnModeler = getModeler(canvasRef.current);

    // set modelerRef.current to the Context so that it can be used in other components
    modelerRef.current = modelerInstance;

    const initializeUnsavedChangesCount = () => {
      modelerInstance.on('commandStack.changed', () => {
        setNumberOfUnsavedChanges((prevCount) => prevCount + 1);
      });
    };

    const eventBus: BpmnModeler = modelerInstance.get('eventBus');
    const events: string[] = ['element.click'];

    events.forEach((event) => {
      eventBus.on(event, (event: any) => {
        if (!event) return;

        const bpmnDetails = {
          ...getBpmnEditorDetailsFromBusinessObject(event.element?.businessObject),
          element: event.element,
        };
        setBpmnDetails(bpmnDetails);
      });
    });

    const initializeEditor = async () => {
      try {
        await modelerInstance.importXML(bpmnXml);
        const canvas: any = modelerInstance.get('canvas');
        canvas.zoom('fit-viewport');
      } catch (exception) {
        console.log('An error occurred while rendering the viewer:', exception);
      }
    };

    initializeEditor();
    initializeUnsavedChangesCount();
  }, [bpmnXml, modelerRef, setBpmnDetails, setNumberOfUnsavedChanges]);

  return { canvasRef, modelerRef };
};
