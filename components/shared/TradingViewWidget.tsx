import React, { useEffect, useRef, memo } from 'react';

declare global {
    interface Window {
        TradingView: any;
    }
}

interface TradingViewWidgetProps {
  symbol: string;
  interval: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol, interval }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<any>(null);

    useEffect(() => {
        const createWidget = () => {
            if (!containerRef.current || typeof window.TradingView === 'undefined' || !window.TradingView.widget) {
                 // If the script isn't loaded yet, or the widget function is not available,
                 // poll every 100ms until it is.
                setTimeout(createWidget, 100);
                return;
            }

            // Clean up any existing widget before creating a new one.
            if (widgetRef.current) {
                try {
                    widgetRef.current.remove();
                } catch (error) {
                    console.error("Error removing previous TradingView widget:", error);
                }
                widgetRef.current = null;
            }
            
            // Ensure the container is empty before appending a new widget
            if(containerRef.current) {
                containerRef.current.innerHTML = '';
            }

            const newWidget = new window.TradingView.widget({
                autosize: true,
                symbol: `BINANCE:${symbol}`,
                interval: interval,
                timezone: "Etc/UTC",
                theme: "dark",
                style: "1",
                locale: "en",
                enable_publishing: false,
                allow_symbol_change: false,
                withdateranges: true,
                hide_side_toolbar: false,
                details: true,
                hotlist: true,
                calendar: true,
                container_id: containerRef.current.id,
                 overrides: {
                    "paneProperties.background": "#0d1117",
                    "paneProperties.vertGridProperties.color": "rgba(48, 54, 61, 0.5)",
                    "paneProperties.horzGridProperties.color": "rgba(48, 54, 61, 0.5)",
                    "symbolWatermarkProperties.color": "rgba(14, 18, 24, 0.8)",
                    "scalesProperties.textColor": "#8b949e",
                    "mainSeriesProperties.candleStyle.upColor": "#2ea043",
                    "mainSeriesProperties.candleStyle.downColor": "#f85149",
                    "mainSeriesProperties.candleStyle.borderUpColor": "#2ea043",
                    "mainSeriesProperties.candleStyle.borderDownColor": "#f85149",
                    "mainSeriesProperties.candleStyle.wickUpColor": "#2ea043",
                    "mainSeriesProperties.candleStyle.wickDownColor": "#f85149",
                }
            });
            widgetRef.current = newWidget;
        };

        createWidget();

        // The cleanup function for when the component unmounts or dependencies change.
        return () => {
            if (widgetRef.current) {
                try {
                    widgetRef.current.remove();
                } catch (error) {
                    console.error("Error removing TradingView widget on cleanup:", error);
                }
                widgetRef.current = null;
            }
        };

    }, [symbol, interval]);

    return (
        <div className="tradingview-widget-container h-full w-full">
            <div 
                ref={containerRef} 
                // Using a static ID is fine here as we ensure it's cleaned up properly.
                id="tradingview_widget_container" 
                className="h-full w-full"
            />
        </div>
    );
};

export default memo(TradingViewWidget);