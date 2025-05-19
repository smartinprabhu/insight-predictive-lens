
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const WeeklyForecastView: React.FC = () => {
  // Sample data - would come from your app's state in reality
  const weeks = [
    { id: 23, range: '6/4 - 6/10', required: 71452, committed: 69798, scheduled: 45618, adherence: 35932 },
    { id: 24, range: '6/11 - 6/17', required: 71324, committed: 67433, scheduled: 47841, adherence: 37329 },
    { id: 25, range: '6/18 - 6/24', required: 70598, committed: 66796, scheduled: 48166, adherence: 36762 },
    { id: 26, range: '6/25 - 7/1', required: 70055, committed: 64493, scheduled: 50074, adherence: 27525 },
  ];
  
  const totals = {
    required: 283430,
    committed: 268520,
    scheduled: 191699,
    adherence: 137547
  };
  
  const sites = [
    { 
      id: 1, 
      name: "BPO #1", 
      weeks: [
        { required: 2304, committed: 2238, scheduled: 2484, adherence: 2459 },
        { required: 2304, committed: 2238, scheduled: 2386, adherence: 2370 },
        { required: 2304, committed: 2238, scheduled: 2437, adherence: 2416 },
        { required: 2304, committed: 2238, scheduled: 2363, adherence: 1856 }
      ],
      totals: { required: 9216, committed: 8952, scheduled: 9670, adherence: 9102 }
    },
    { 
      id: 2, 
      name: "BPO #2", 
      weeks: [
        { required: 1475, committed: 1368, scheduled: 1581, adherence: 1021 },
        { required: 1475, committed: 1368, scheduled: 1567, adherence: 989 },
        { required: 1474, committed: 1368, scheduled: 1515, adherence: 938 },
        { required: 1473, committed: 1368, scheduled: 1525, adherence: 757 }
      ],
      totals: { required: 5897, committed: 5472, scheduled: 6188, adherence: 3705 }
    },
    { 
      id: 3, 
      name: "BPO #3", 
      weeks: [
        { required: 190, committed: 0, scheduled: 1068, adherence: 205 },
        { required: 190, committed: 0, scheduled: 1168, adherence: 220 },
        { required: 190, committed: 0, scheduled: 1151, adherence: 194 },
        { required: 190, committed: 0, scheduled: 1021, adherence: 161 }
      ],
      totals: { required: 760, committed: 0, scheduled: 4407, adherence: 780 }
    }
  ];

  // Function to format numbers with thousands separators
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  // Function to calculate variance (difference) and determine its class
  const getVariance = (actual: number, required: number): { value: number, className: string } => {
    const variance = actual - required;
    let className = '';
    
    if (variance < 0) {
      className = 'inline-flex items-center justify-center rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 text-xs';
    } else if (variance > 0) {
      className = 'inline-flex items-center justify-center rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 text-xs';
    } else {
      className = 'inline-flex items-center justify-center rounded-md bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 px-2 py-1 text-xs';
    }
    
    return { value: variance, className };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]"></TableHead>
                {weeks.map((week) => (
                  <TableHead key={week.id} className="text-center">
                    <div>Week {week.id}</div>
                    <div className="text-xs">{week.range}</div>
                  </TableHead>
                ))}
                <TableHead className="text-center">
                  <div>Month Sum</div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-muted/30">
                <TableCell className="font-medium">Selected sites total</TableCell>
                {weeks.map((week, idx) => (
                  <TableCell key={idx} className="text-center">{formatNumber(week.required)}</TableCell>
                ))}
                <TableCell className="text-center font-medium">{formatNumber(totals.required)}</TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="pl-6">Required (week)</TableCell>
                {weeks.map((week, idx) => (
                  <TableCell key={idx} className="text-center">{formatNumber(week.required)}</TableCell>
                ))}
                <TableCell className="text-center">{formatNumber(totals.required)}</TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="pl-6">Committed (week)</TableCell>
                {weeks.map((week, idx) => {
                  const variance = getVariance(week.committed, week.required);
                  return (
                    <TableCell key={idx} className="text-center">
                      {formatNumber(week.committed)}
                      <div className={variance.className}>
                        {variance.value > 0 ? '+' : ''}{formatNumber(variance.value)}
                      </div>
                    </TableCell>
                  );
                })}
                <TableCell className="text-center">
                  {formatNumber(totals.committed)}
                  <div className={getVariance(totals.committed, totals.required).className}>
                    {totals.committed - totals.required > 0 ? '+' : ''}
                    {formatNumber(totals.committed - totals.required)}
                  </div>
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="pl-6">Scheduled</TableCell>
                {weeks.map((week, idx) => {
                  const variance = getVariance(week.scheduled, week.committed);
                  return (
                    <TableCell key={idx} className="text-center">
                      {formatNumber(week.scheduled)}
                      <div className={variance.className}>
                        {variance.value > 0 ? '+' : ''}{formatNumber(variance.value)}
                      </div>
                    </TableCell>
                  );
                })}
                <TableCell className="text-center">
                  {formatNumber(totals.scheduled)}
                  <div className={getVariance(totals.scheduled, totals.committed).className}>
                    {totals.scheduled - totals.committed > 0 ? '+' : ''}
                    {formatNumber(totals.scheduled - totals.committed)}
                  </div>
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="pl-6">Adherence</TableCell>
                {weeks.map((week, idx) => {
                  const variance = getVariance(week.adherence, week.scheduled);
                  return (
                    <TableCell key={idx} className="text-center">
                      {formatNumber(week.adherence)}
                      <div className={variance.className}>
                        {variance.value > 0 ? '+' : ''}{formatNumber(variance.value)}
                      </div>
                    </TableCell>
                  );
                })}
                <TableCell className="text-center">
                  {formatNumber(totals.adherence)}
                  <div className={getVariance(totals.adherence, totals.scheduled).className}>
                    {totals.adherence - totals.scheduled > 0 ? '+' : ''}
                    {formatNumber(totals.adherence - totals.scheduled)}
                  </div>
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell colSpan={6} className="bg-muted/50 h-2 p-0"></TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="font-bold uppercase text-xs text-muted-foreground">SITES</TableCell>
                <TableCell colSpan={5}></TableCell>
              </TableRow>
              
              {/* Individual Sites */}
              {sites.map((site) => (
                <React.Fragment key={site.id}>
                  <TableRow>
                    <TableCell className="font-medium flex items-center gap-2">
                      {site.name}
                      <button className="ml-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      </button>
                    </TableCell>
                    <TableCell colSpan={5}></TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell className="pl-6">Required (week)</TableCell>
                    {site.weeks.map((week, idx) => (
                      <TableCell key={idx} className="text-center">{formatNumber(week.required)}</TableCell>
                    ))}
                    <TableCell className="text-center">{formatNumber(site.totals.required)}</TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell className="pl-6">Committed (week)</TableCell>
                    {site.weeks.map((week, idx) => {
                      const variance = getVariance(week.committed, week.required);
                      return (
                        <TableCell key={idx} className="text-center">
                          {formatNumber(week.committed)}
                          {week.committed !== 0 && (
                            <div className={variance.className}>
                              {variance.value > 0 ? '+' : ''}{formatNumber(variance.value)}
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center">
                      {formatNumber(site.totals.committed)}
                      {site.totals.committed !== 0 && (
                        <div className={getVariance(site.totals.committed, site.totals.required).className}>
                          {site.totals.committed - site.totals.required > 0 ? '+' : ''}
                          {formatNumber(site.totals.committed - site.totals.required)}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell className="pl-6">Scheduled</TableCell>
                    {site.weeks.map((week, idx) => {
                      const variance = getVariance(week.scheduled, week.committed);
                      return (
                        <TableCell key={idx} className="text-center">
                          {formatNumber(week.scheduled)}
                          <div className={site.weeks[idx].committed === 0 ? '' : variance.className}>
                            {site.weeks[idx].committed === 0 ? '' : (variance.value > 0 ? '+' : '') + formatNumber(variance.value)}
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center">
                      {formatNumber(site.totals.scheduled)}
                      {site.totals.committed !== 0 && (
                        <div className={getVariance(site.totals.scheduled, site.totals.committed).className}>
                          {site.totals.scheduled - site.totals.committed > 0 ? '+' : ''}
                          {formatNumber(site.totals.scheduled - site.totals.committed)}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell className="pl-6">Adherence</TableCell>
                    {site.weeks.map((week, idx) => {
                      const variance = getVariance(week.adherence, week.scheduled);
                      return (
                        <TableCell key={idx} className="text-center">
                          {formatNumber(week.adherence)}
                          <div className={variance.className}>
                            {variance.value > 0 ? '+' : ''}{formatNumber(variance.value)}
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center">
                      {formatNumber(site.totals.adherence)}
                      <div className={getVariance(site.totals.adherence, site.totals.scheduled).className}>
                        {site.totals.adherence - site.totals.scheduled > 0 ? '+' : ''}
                        {formatNumber(site.totals.adherence - site.totals.scheduled)}
                      </div>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
