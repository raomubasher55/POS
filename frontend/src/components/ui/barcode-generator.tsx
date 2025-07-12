import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Download, Copy } from 'lucide-react';

interface BarcodeGeneratorProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  format?: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC';
}

export function BarcodeGenerator({ 
  value, 
  width = 2,
  height = 100,
  displayValue = true,
  format = 'CODE128'
}: BarcodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    generateBarcode();
  }, [value, width, height, displayValue, format]);

  const generateBarcode = () => {
    if (!value) return;

    // Simple barcode generation using SVG
    // In a real implementation, you would use a library like JsBarcode
    try {
      const svg = svgRef.current;
      if (!svg) return;

      // Clear previous content
      svg.innerHTML = '';

      // Simple bar pattern generation (simplified for demo)
      const binaryString = convertToBinary(value);
      const barWidth = width;
      const totalWidth = binaryString.length * barWidth;
      
      svg.setAttribute('width', totalWidth.toString());
      svg.setAttribute('height', (height + (displayValue ? 20 : 0)).toString());
      svg.setAttribute('viewBox', `0 0 ${totalWidth} ${height + (displayValue ? 20 : 0)}`);

      // Generate bars
      binaryString.split('').forEach((bit, index) => {
        if (bit === '1') {
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', (index * barWidth).toString());
          rect.setAttribute('y', '0');
          rect.setAttribute('width', barWidth.toString());
          rect.setAttribute('height', height.toString());
          rect.setAttribute('fill', 'black');
          svg.appendChild(rect);
        }
      });

      // Add text if displayValue is true
      if (displayValue) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (totalWidth / 2).toString());
        text.setAttribute('y', (height + 15).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-family', 'monospace');
        text.setAttribute('font-size', '12');
        text.setAttribute('fill', 'black');
        text.textContent = value;
        svg.appendChild(text);
      }
    } catch (error) {
      console.error('Error generating barcode:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate barcode',
        variant: 'destructive',
      });
    }
  };

  const convertToBinary = (input: string): string => {
    // Simplified binary conversion for demo
    // In reality, each barcode format has specific encoding rules
    let binary = '';
    for (let i = 0; i < input.length; i++) {
      const charCode = input.charCodeAt(i);
      const binaryChar = (charCode % 2 === 0 ? '1010' : '0101');
      binary += binaryChar;
    }
    
    // Add start and end patterns
    return '11010010000' + binary + '11010010000';
  };

  const downloadBarcode = () => {
    try {
      const svg = svgRef.current;
      if (!svg) return;

      // Convert SVG to image and download
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width * 2; // Scale up for better quality
        canvas.height = img.height * 2;
        
        if (ctx) {
          ctx.scale(2, 2);
          ctx.drawImage(img, 0, 0);
          
          // Download canvas as PNG
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `barcode-${value}.png`;
              a.click();
              URL.revokeObjectURL(url);
              
              toast({
                title: 'Success',
                description: 'Barcode downloaded successfully',
              });
            }
          });
        }
      };

      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      img.src = url;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download barcode',
        variant: 'destructive',
      });
    }
  };

  const copyBarcodeValue = () => {
    navigator.clipboard.writeText(value).then(() => {
      toast({
        title: 'Copied',
        description: 'Barcode value copied to clipboard',
      });
    }).catch(() => {
      toast({
        title: 'Error',
        description: 'Failed to copy barcode value',
        variant: 'destructive',
      });
    });
  };

  if (!value) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Barcode Generator</CardTitle>
          <CardDescription>No value provided for barcode generation</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Barcode</CardTitle>
        <CardDescription>
          Format: {format} • Value: {value}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center p-4 bg-white border rounded-lg">
          <svg ref={svgRef} className="border border-gray-200" />
        </div>
        
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={copyBarcodeValue}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Value
          </Button>
          <Button variant="outline" size="sm" onClick={downloadBarcode}>
            <Download className="h-4 w-4 mr-2" />
            Download PNG
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground text-center">
          <p>Note: This is a simplified barcode generator for demonstration.</p>
          <p>For production use, integrate with a proper barcode library like JsBarcode.</p>
        </div>
      </CardContent>
    </Card>
  );
}