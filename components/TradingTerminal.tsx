import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Card from './shared/Card';
import Icon from './shared/Icon';
import { CHEVRON_DOWN_ICON } from '../constants';
import TradingViewWidget from './shared/TradingViewWidget';
import { Order, Trade } from '../types';


const PAIRS = [
    { id: 'BTC/USDT', name: 'BTC/USDT', basePrice: 67100, decimals: 2 },
    { id: 'ETH/USDT', name: 'ETH/USDT', basePrice: 3500, decimals: 2 },
    { id: 'ETH/BTC', name: 'ETH/BTC', basePrice: 0.052, decimals: 5 },
];

const TIMEFRAMES = ['1H', '4H', '1D'];
const TIMEFRAME_MAP: { [key: string]: string } = {
    '1H': '60',
    '4H': '240',
    '1D': 'D'
};


const generateOrderBookSnapshot = (basePrice: number): { bids: Order[], asks: Order[] } => {
    const book = {
        bids: [...Array(12)].map((_, i) => ({ price: basePrice - (i + 1) * (basePrice * 0.0001), amount: Math.random() * 2, total: 0 })),
        asks: [...Array(12)].map((_, i) => ({ price: basePrice + (i + 1) * (basePrice * 0.0001), amount: Math.random() * 2, total: 0 }))
    };
    book.bids.forEach(o => o.total = o.price * o.amount);
    book.asks.forEach(o => o.total = o.price * o.amount);
    return book;
};

const generateTradeHistorySnapshot = (basePrice: number): Trade[] => {
    return [...Array(20)].map((_, i) => ({
        id: Date.now() + i,
        time: new Date(Date.now() - i * 5000).toLocaleTimeString(),
        price: basePrice - (Math.random() - 0.5) * (basePrice * 0.0005),
        amount: Math.random() * 0.5,
        side: Math.random() > 0.5 ? 'buy' : 'sell'
    }));
};

const TradingTerminal: React.FC = () => {
    const [activePair, setActivePair] = useState(PAIRS[0]);
    const [activeTimeframe, setActiveTimeframe] = useState('1H');
    const [isPairDropdownOpen, setIsPairDropdownOpen] = useState(false);
    
    // Data state - now loaded as a snapshot on pair change
    const [orderBook, setOrderBook] = useState(() => generateOrderBookSnapshot(activePair.basePrice));
    const [tradeHistory, setTradeHistory] = useState<Trade[]>(() => generateTradeHistorySnapshot(activePair.basePrice));
    const [currentPrice, setCurrentPrice] = useState(activePair.basePrice);
    const lastPriceRef = useRef(currentPrice);

    const [tradeForm, setTradeForm] = useState({ price: '', amount: '' });


    const tradingViewSymbol = useMemo(() => activePair.id.replace('/', ''), [activePair]);
    const tradingViewInterval = useMemo(() => TIMEFRAME_MAP[activeTimeframe], [activeTimeframe]);
    
    // Effect to load new data snapshots when the active pair changes
    useEffect(() => {
        setCurrentPrice(activePair.basePrice);
        setOrderBook(generateOrderBookSnapshot(activePair.basePrice));
        setTradeHistory(generateTradeHistorySnapshot(activePair.basePrice));
        setTradeForm({ price: '', amount: '' });
    }, [activePair]);

    const handleOrderBookClick = useCallback((price: number) => {
        setTradeForm(prev => ({...prev, price: price.toFixed(activePair.decimals)}));
    }, [activePair.decimals]);

    // Track price changes for color updates
    const priceChange = currentPrice - lastPriceRef.current;
    const priceColorClass = priceChange > 0 ? 'text-accent-secondary' : priceChange < 0 ? 'text-accent-danger' : 'text-white';
    useEffect(() => {
        lastPriceRef.current = currentPrice;
    }, [currentPrice]);


    const OrderBookDisplay: React.FC<{ data: { bids: Order[], asks: Order[] }, onRowClick: (price: number) => void }> = React.memo(({ data, onRowClick }) => (
        <div className="text-xs">
            <div className="grid grid-cols-3 gap-2 px-2 py-1 font-bold text-basetitan-text-secondary border-b border-basetitan-border">
                <span>Price ({activePair.id.split('/')[1]})</span>
                <span className="text-right">Amount ({activePair.id.split('/')[0]})</span>
                <span className="text-right">Total ({activePair.id.split('/')[1]})</span>
            </div>
            <div className="h-40 overflow-y-auto">
                {/* Asks */}
                {data.asks.map((ask, i) => (
                    <div key={`ask-${ask.price}-${i}`} className="grid grid-cols-3 gap-2 px-2 py-1 relative hover:bg-basetitan-dark cursor-pointer" onClick={() => onRowClick(ask.price)}>
                        <span className="text-accent-danger">{ask.price.toFixed(activePair.decimals)}</span>
                        <span className="text-right">{ask.amount.toFixed(4)}</span>
                        <span className="text-right">{ask.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                ))}
                <div className="text-lg font-bold text-center py-1 text-white border-t border-b border-basetitan-border">
                   {currentPrice.toLocaleString(undefined, {minimumFractionDigits: activePair.decimals, maximumFractionDigits: activePair.decimals})}
                </div>
                {/* Bids */}
                {data.bids.map((bid, i) => (
                     <div key={`bid-${bid.price}-${i}`} className="grid grid-cols-3 gap-2 px-2 py-1 relative hover:bg-basetitan-dark cursor-pointer" onClick={() => onRowClick(bid.price)}>
                        <span className="text-accent-secondary">{bid.price.toFixed(activePair.decimals)}</span>
                        <span className="text-right">{bid.amount.toFixed(4)}</span>
                        <span className="text-right">{bid.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                ))}
            </div>
        </div>
    ));

    const TradeHistoryDisplay: React.FC<{ data: Trade[] }> = React.memo(({ data }) => (
        <div className="text-xs">
             <div className="grid grid-cols-3 gap-2 px-2 py-1 font-bold text-basetitan-text-secondary border-b border-basetitan-border">
                <span>Time</span>
                <span className="text-right">Price ({activePair.id.split('/')[1]})</span>
                <span className="text-right">Amount ({activePair.id.split('/')[0]})</span>
            </div>
            <div className="h-40 overflow-y-auto">
                {data.map((trade) => (
                    <div key={trade.id} className={`grid grid-cols-3 gap-2 px-2 py-1 ${trade.side === 'buy' ? 'text-accent-secondary' : 'text-accent-danger'}`}>
                        <span>{trade.time}</span>
                        <span className="text-right">{trade.price.toFixed(activePair.decimals)}</span>
                        <span className="text-right">{trade.amount.toFixed(4)}</span>
                    </div>
                ))}
            </div>
        </div>
    ));

    return (
        <div className="h-full flex flex-col p-4 space-y-4">
            <div className="flex-shrink-0 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <button onClick={() => setIsPairDropdownOpen(!isPairDropdownOpen)} className="flex items-center space-x-2">
                           <h2 className="text-2xl font-bold text-white">{activePair.name}</h2>
                           <Icon className="w-5 h-5 text-basetitan-text-secondary">{CHEVRON_DOWN_ICON}</Icon>
                        </button>
                        {isPairDropdownOpen && (
                            <div className="absolute top-full mt-2 w-48 bg-basetitan-light border border-basetitan-border rounded-md shadow-lg z-10">
                                {PAIRS.map(pair => (
                                    <button
                                        key={pair.id}
                                        onClick={() => {
                                            setActivePair(pair);
                                            setIsPairDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-basetitan-dark"
                                    >
                                        {pair.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className={`text-2xl font-bold transition-colors duration-300 ${priceColorClass}`}>
                             {currentPrice.toLocaleString(undefined, { minimumFractionDigits: activePair.decimals, maximumFractionDigits: activePair.decimals })}
                        </p>
                        <p className="text-sm text-basetitan-text-secondary">Last price</p>
                    </div>
                </div>
                <div className="flex items-center space-x-1 bg-basetitan-light p-1 rounded-md border border-basetitan-border">
                    {TIMEFRAMES.map(tf => (
                        <button 
                            key={tf}
                            onClick={() => setActiveTimeframe(tf)}
                            className={`px-3 py-1 text-sm font-semibold rounded ${activeTimeframe === tf ? 'bg-accent-primary text-white' : 'text-basetitan-text-secondary'}`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3 h-[400px] lg:h-full">
                   <TradingViewWidget symbol={tradingViewSymbol} interval={tradingViewInterval} />
                </div>
                
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <h3 className="font-bold text-white mb-4">Place Order</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <input type="number" placeholder={`Price (${activePair.id.split('/')[1]})`} 
                                 value={tradeForm.price}
                                 onChange={(e) => setTradeForm(prev => ({...prev, price: e.target.value}))}
                                className="w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2 focus:ring-accent-primary focus:border-accent-primary" />
                                
                                <input type="number" placeholder={`Amount (${activePair.id.split('/')[0]})`}
                                 value={tradeForm.amount}
                                 onChange={(e) => setTradeForm(prev => ({...prev, amount: e.target.value}))}
                                className="w-full bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2 focus:ring-accent-primary focus:border-accent-primary" />
                            </div>
                            <div className="flex space-x-2">
                                <button className="w-full bg-accent-secondary hover:bg-accent-secondary-hover text-white font-bold py-2 rounded-md">Buy / Long</button>
                                <button className="w-full bg-accent-danger hover:opacity-90 text-white font-bold py-2 rounded-md">Sell / Short</button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <h3 className="font-bold text-white mb-2">Order Book</h3>
                    <OrderBookDisplay data={orderBook} onRowClick={handleOrderBookClick} />
                </Card>
                <Card>
                    <h3 className="font-bold text-white mb-2">Trade History</h3>
                    <TradeHistoryDisplay data={tradeHistory} />
                </Card>
            </div>
        </div>
    );
};

export default TradingTerminal;