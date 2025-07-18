import { useEffect } from 'react';

interface UseSubheaderDataOptions {
  data: any[];
  targetElement: string;
  setSubheaderData?: (data: any[]) => void;
  setTargetElement?: (element: string) => void;
}

export const useSubheaderData = ({ 
  data, 
  targetElement, 
  setSubheaderData, 
  setTargetElement 
}: UseSubheaderDataOptions) => {
  useEffect(() => {
    if (setSubheaderData && setTargetElement && data.length > 0) {
      setTargetElement(targetElement);
      setSubheaderData(data);
    }
  }, [data, targetElement, setSubheaderData, setTargetElement]);
}; 