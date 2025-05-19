import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Types for our assumptions data
interface ChannelAssumption {
  aht: number; // in seconds
  productivity: number; // contacts per hour
  occupancy: number; // percentage (0-100)
}

interface Assumptions {
  channelMix: {
    voice: number; // percentage
    chat: number; // percentage
    email: number; // percentage
  };
  languageSplit: {
    english: number; // percentage
    bilingual: number; // percentage
  };
  channels: {
    voice: ChannelAssumption;
    chat: ChannelAssumption;
    email: ChannelAssumption;
  };
  shrinkage: number; // percentage
  ibeHandling: number; // percentage
  locationSplit: {
    onshore: number; // percentage
    offshore: number; // percentage
  };
}

export const AssumptionsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [assumptions, setAssumptions] = useState<Assumptions>({
    channelMix: {
      voice: 60,
      chat: 25,
      email: 15,
    },
    languageSplit: {
      english: 80,
      bilingual: 20,
    },
    channels: {
      voice: {
        aht: 360, // 6 minutes in seconds
        productivity: 8,
        occupancy: 85,
      },
      chat: {
        aht: 300, // 5 minutes in seconds
        productivity: 10,
        occupancy: 85,
      },
      email: {
        aht: 480, // 8 minutes in seconds
        productivity: 6,
        occupancy: 85,
      },
    },
    shrinkage: 25, // 25%
    ibeHandling: 15, // 15%
    locationSplit: {
      onshore: 70,
      offshore: 30,
    },
  });

  // Helper to update channel mix while keeping total at 100%
  const updateChannelMix = (channel: keyof typeof assumptions.channelMix, value: number) => {
    const currentTotal = Object.values(assumptions.channelMix).reduce((a, b) => a + b, 0);
    const delta = value - assumptions.channelMix[channel];
    
    if (currentTotal + delta !== 100) {
      // Adjust other channels proportionally
      const otherChannels = Object.keys(assumptions.channelMix).filter(k => k !== channel) as Array<keyof typeof assumptions.channelMix>;
      const otherTotal = otherChannels.reduce((total, c) => total + assumptions.channelMix[c], 0);
      
      if (otherTotal > 0) {
        const newOtherValues: Partial<typeof assumptions.channelMix> = {};
        otherChannels.forEach(c => {
          const ratio = assumptions.channelMix[c] / otherTotal;
          newOtherValues[c] = Math.max(0, assumptions.channelMix[c] - (delta * ratio));
        });
        
        setAssumptions(prev => ({
          ...prev,
          channelMix: {
            ...prev.channelMix,
            [channel]: value,
            ...newOtherValues
          }
        }));
      }
    } else {
      setAssumptions(prev => ({
        ...prev,
        channelMix: {
          ...prev.channelMix,
          [channel]: value,
        }
      }));
    }
  };
  
  // Helper to update language split while keeping total at 100%
  const updateLanguageSplit = (language: keyof typeof assumptions.languageSplit, value: number) => {
    setAssumptions(prev => ({
      ...prev,
      languageSplit: {
        ...prev.languageSplit,
        [language]: value,
        [language === 'english' ? 'bilingual' : 'english']: 100 - value,
      }
    }));
  };
  
  // Helper to update location split while keeping total at 100%
  const updateLocationSplit = (location: keyof typeof assumptions.locationSplit, value: number) => {
    setAssumptions(prev => ({
      ...prev,
      locationSplit: {
        ...prev.locationSplit,
        [location]: value,
        [location === 'onshore' ? 'offshore' : 'onshore']: 100 - value,
      }
    }));
  };

  // Helper for rendering info tooltips
  const InfoTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground">
            <Info className="h-3.5 w-3.5" />
            <span className="sr-only">Info</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="general">General Assumptions</TabsTrigger>
          <TabsTrigger value="channel">Channel Parameters</TabsTrigger>
          <TabsTrigger value="location">Location Split</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Channel Mix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="voice-mix">Voice</Label>
                    <InfoTooltip content="Percentage of total forecast volume allocated to Voice channel" />
                  </div>
                  <span className="text-sm font-medium">{assumptions.channelMix.voice}%</span>
                </div>
                <Slider
                  id="voice-mix"
                  value={[assumptions.channelMix.voice]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) => updateChannelMix('voice', value)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="chat-mix">Chat</Label>
                    <InfoTooltip content="Percentage of total forecast volume allocated to Chat channel" />
                  </div>
                  <span className="text-sm font-medium">{assumptions.channelMix.chat}%</span>
                </div>
                <Slider
                  id="chat-mix"
                  value={[assumptions.channelMix.chat]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) => updateChannelMix('chat', value)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="email-mix">Email</Label>
                    <InfoTooltip content="Percentage of total forecast volume allocated to Email channel" />
                  </div>
                  <span className="text-sm font-medium">{assumptions.channelMix.email}%</span>
                </div>
                <Slider
                  id="email-mix"
                  value={[assumptions.channelMix.email]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) => updateChannelMix('email', value)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Language Split</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="english-split">English</Label>
                    <InfoTooltip content="Percentage of volume handled in English" />
                  </div>
                  <span className="text-sm font-medium">{assumptions.languageSplit.english}%</span>
                </div>
                <Slider
                  id="english-split"
                  value={[assumptions.languageSplit.english]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) => updateLanguageSplit('english', value)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="bilingual-split">Bilingual</Label>
                    <InfoTooltip content="Percentage of volume handled in other languages" />
                  </div>
                  <span className="text-sm font-medium">{assumptions.languageSplit.bilingual}%</span>
                </div>
                <Slider
                  id="bilingual-split"
                  value={[assumptions.languageSplit.bilingual]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) => updateLanguageSplit('bilingual', value)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">General Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="shrinkage">Shrinkage %</Label>
                    <InfoTooltip content="Percentage of non-productive time (training, meetings, breaks, etc). Typical call centers have ~30-35% shrinkage." />
                  </div>
                  <span className="text-sm font-medium">{assumptions.shrinkage}%</span>
                </div>
                <Slider
                  id="shrinkage"
                  value={[assumptions.shrinkage]}
                  min={0}
                  max={50}
                  step={1}
                  onValueChange={([value]) => setAssumptions(prev => ({ ...prev, shrinkage: value }))}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="ibe-handling">IBE Handling %</Label>
                    <InfoTooltip content="Portion of incoming email/chat volume handled by a dedicated team (Information By Email)" />
                  </div>
                  <span className="text-sm font-medium">{assumptions.ibeHandling}%</span>
                </div>
                <Slider
                  id="ibe-handling"
                  value={[assumptions.ibeHandling]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) => setAssumptions(prev => ({ ...prev, ibeHandling: value }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="channel" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Voice Channel Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="voice-aht">Average Handle Time (sec)</Label>
                    <InfoTooltip content="Average time in seconds an agent spends handling a voice contact" />
                  </div>
                  <Input
                    id="voice-aht"
                    type="number"
                    value={assumptions.channels.voice.aht}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setAssumptions(prev => ({
                          ...prev,
                          channels: {
                            ...prev.channels,
                            voice: {
                              ...prev.channels.voice,
                              aht: value
                            }
                          }
                        }));
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="voice-productivity">Productivity (per hour)</Label>
                    <InfoTooltip content="Average contacts handled per agent-hour for voice" />
                  </div>
                  <Input
                    id="voice-productivity"
                    type="number"
                    value={assumptions.channels.voice.productivity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setAssumptions(prev => ({
                          ...prev,
                          channels: {
                            ...prev.channels,
                            voice: {
                              ...prev.channels.voice,
                              productivity: value
                            }
                          }
                        }));
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="voice-occupancy">Occupancy %</Label>
                    <InfoTooltip content="Percentage of logged-in time that agents spend actively handling voice contacts" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Slider
                      id="voice-occupancy"
                      value={[assumptions.channels.voice.occupancy]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([value]) => setAssumptions(prev => ({
                        ...prev,
                        channels: {
                          ...prev.channels,
                          voice: {
                            ...prev.channels.voice,
                            occupancy: value
                          }
                        }
                      }))}
                    />
                    <span className="min-w-[40px] text-center">{assumptions.channels.voice.occupancy}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Chat Channel Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="chat-aht">Average Handle Time (sec)</Label>
                    <InfoTooltip content="Average time in seconds an agent spends handling a chat contact" />
                  </div>
                  <Input
                    id="chat-aht"
                    type="number"
                    value={assumptions.channels.chat.aht}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setAssumptions(prev => ({
                          ...prev,
                          channels: {
                            ...prev.channels,
                            chat: {
                              ...prev.channels.chat,
                              aht: value
                            }
                          }
                        }));
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="chat-productivity">Productivity (per hour)</Label>
                    <InfoTooltip content="Average contacts handled per agent-hour for chat" />
                  </div>
                  <Input
                    id="chat-productivity"
                    type="number"
                    value={assumptions.channels.chat.productivity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setAssumptions(prev => ({
                          ...prev,
                          channels: {
                            ...prev.channels,
                            chat: {
                              ...prev.channels.chat,
                              productivity: value
                            }
                          }
                        }));
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="chat-occupancy">Occupancy %</Label>
                    <InfoTooltip content="Percentage of logged-in time that agents spend actively handling chat contacts" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Slider
                      id="chat-occupancy"
                      value={[assumptions.channels.chat.occupancy]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([value]) => setAssumptions(prev => ({
                        ...prev,
                        channels: {
                          ...prev.channels,
                          chat: {
                            ...prev.channels.chat,
                            occupancy: value
                          }
                        }
                      }))}
                    />
                    <span className="min-w-[40px] text-center">{assumptions.channels.chat.occupancy}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Email Channel Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="email-aht">Average Handle Time (sec)</Label>
                    <InfoTooltip content="Average time in seconds an agent spends handling an email contact" />
                  </div>
                  <Input
                    id="email-aht"
                    type="number"
                    value={assumptions.channels.email.aht}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setAssumptions(prev => ({
                          ...prev,
                          channels: {
                            ...prev.channels,
                            email: {
                              ...prev.channels.email,
                              aht: value
                            }
                          }
                        }));
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="email-productivity">Productivity (per hour)</Label>
                    <InfoTooltip content="Average contacts handled per agent-hour for email" />
                  </div>
                  <Input
                    id="email-productivity"
                    type="number"
                    value={assumptions.channels.email.productivity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setAssumptions(prev => ({
                          ...prev,
                          channels: {
                            ...prev.channels,
                            email: {
                              ...prev.channels.email,
                              productivity: value
                            }
                          }
                        }));
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="email-occupancy">Occupancy %</Label>
                    <InfoTooltip content="Percentage of logged-in time that agents spend actively handling email contacts" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Slider
                      id="email-occupancy"
                      value={[assumptions.channels.email.occupancy]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([value]) => setAssumptions(prev => ({
                        ...prev,
                        channels: {
                          ...prev.channels,
                          email: {
                            ...prev.channels.email,
                            occupancy: value
                          }
                        }
                      }))}
                    />
                    <span className="min-w-[40px] text-center">{assumptions.channels.email.occupancy}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="location" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Onshore/Offshore Split</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="onshore">Onshore %</Label>
                    <InfoTooltip content="Percentage of work assigned to onshore locations" />
                  </div>
                  <span className="text-sm font-medium">{assumptions.locationSplit.onshore}%</span>
                </div>
                <Slider
                  id="onshore"
                  value={[assumptions.locationSplit.onshore]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) => updateLocationSplit('onshore', value)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="offshore">Offshore %</Label>
                    <InfoTooltip content="Percentage of work assigned to offshore locations" />
                  </div>
                  <span className="text-sm font-medium">{assumptions.locationSplit.offshore}%</span>
                </div>
                <Slider
                  id="offshore"
                  value={[assumptions.locationSplit.offshore]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) => updateLocationSplit('offshore', value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Assumptions</Button>
      </div>
    </div>
  );
};
