import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { Dashboard } from './Dashboard'; // Assuming Dashboard is a named export
import {
  initialMockRawCapacityData,
  ALL_BUSINESS_UNITS,
  BUSINESS_UNIT_CONFIG,
  ALL_TEAM_NAMES,
  ALL_WEEKS_HEADERS, // Needed for "latestPeriod" logic consistency
  LineOfBusinessName,
  TeamName,
  BusinessUnitName,
} from './PlanningTab';

// Mocking lucide-react icons
jest.mock('lucide-react', () => {
  const originalModule = jest.requireActual('lucide-react');
  return {
    ...originalModule,
    AlertCircle: () => <svg data-testid="alert-icon" />,
  };
});

// Provide a basic mock for ui2 components if they cause issues without full styling/logic
jest.mock('./ui2/table', () => ({
  ...jest.requireActual('./ui2/table'), // Keep original exports
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
}));

jest.mock('./ui2/card', () => ({
  ...jest.requireActual('./ui2/card'),
  Card: ({ children }: { children: React.ReactNode }) => <div className="card">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div className="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3 className="card-title">{children}</h3>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div className="card-content">{children}</div>,
}));

jest.mock('./ui2/select', () => ({
  ...jest.requireActual('./ui2/select'),
  Select: ({ children }: { children: React.ReactNode }) => <div className="select">{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <button className="select-trigger">{children}</button>,
  SelectValue: () => <span className="select-value"></span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div className="select-content">{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode, value: string }) => <div data-value={value}>{children}</div>,
}));


describe('Dashboard Component', () => {
  test('renders without crashing and displays all BUs by default', () => {
    render(<Dashboard />);
    expect(screen.getByText('Overview Dashboard')).toBeInTheDocument();

    ALL_BUSINESS_UNITS.forEach(buName => {
      // Check for BU Name in Card Titles
      const buCards = screen.getAllByText(buName).filter(el => el.tagName === 'H3'); // Assuming BU names are in CardTitles (h3)
      expect(buCards.length).toBeGreaterThan(0);
    });
  });

  test('displays LOBs and their total cases for a specific BU (WFS)', async () => {
    render(<Dashboard />);

    const wfsBuName: BusinessUnitName = "WFS";
    // Find the card for WFS. We expect the BU name to be a heading.
    // There might be multiple elements with text "WFS" (e.g. filter option), so we look for the one acting as a card title.
    const buCardTitle = await screen.findByText(wfsBuName, { selector: 'h3.card-title' });
    const buCard = buCardTitle.closest('.card');
    expect(buCard).toBeInTheDocument();

    if (!buCard) throw new Error("WFS BU Card not found");

    const wfsConfig = BUSINESS_UNIT_CONFIG[wfsBuName];
    wfsConfig.lobs.forEach(lobName => {
      expect(within(buCard).getByText(lobName)).toBeInTheDocument();
    });

    // Verify total cases for "US Chat" in WFS
    const usChatLobName: LineOfBusinessName<"WFS"> = "US Chat";
    const usChatLobEntry = initialMockRawCapacityData.find(
      entry => entry.bu === wfsBuName && entry.lob === usChatLobName
    );
    let expectedTotalCasesUsChat = 0;
    if (usChatLobEntry && usChatLobEntry.lobVolumeForecast) {
      expectedTotalCasesUsChat = Object.values(usChatLobEntry.lobVolumeForecast).reduce(
        (sum, forecast) => sum + (forecast || 0),
        0
      );
    }
    // The text will be "Total Cases: {value}"
    const usChatCasesText = within(buCard).getByText(`Total Cases: ${expectedTotalCasesUsChat.toLocaleString()}`, { exact: false });
    expect(usChatCasesText).toBeInTheDocument();


    // Verify total cases for "Core Support" in WFS
    const coreSupportLobName: LineOfBusinessName<"WFS"> = "Core Support";
    const coreSupportLobEntry = initialMockRawCapacityData.find(
      entry => entry.bu === wfsBuName && entry.lob === coreSupportLobName
    );
    let expectedTotalCasesCoreSupport = 0;
    if (coreSupportLobEntry && coreSupportLobEntry.lobVolumeForecast) {
        expectedTotalCasesCoreSupport = Object.values(coreSupportLobEntry.lobVolumeForecast).reduce(
        (sum, forecast) => sum + (forecast || 0),
        0
      );
    }
    const coreSupportCasesText = within(buCard).getByText(`Total Cases: ${expectedTotalCasesCoreSupport.toLocaleString()}`, { exact: false });
    expect(coreSupportCasesText).toBeInTheDocument();
  });

  test('displays team volumes for a specific LOB (US Chat in WFS)', async () => {
    render(<Dashboard />);
    const wfsBuName: BusinessUnitName = "WFS";
    const usChatLobName: LineOfBusinessName<"WFS"> = "US Chat";

    const buCardTitle = await screen.findByText(wfsBuName, { selector: 'h3.card-title' });
    const buCard = buCardTitle.closest('.card');
    expect(buCard).toBeInTheDocument();
    if (!buCard) throw new Error("WFS BU Card not found");

    // Find the LOB card/section within the BU card
    // LOB names are also card titles within the BU card content
    const lobCardTitle = within(buCard).getByText(usChatLobName, { selector: 'h3.card-title' });
    const lobCard = lobCardTitle.closest('.card'); // Each LOB is also a card
    expect(lobCard).toBeInTheDocument();
    if (!lobCard) throw new Error("US Chat LOB Card not found");

    ALL_TEAM_NAMES.forEach(teamName => {
      expect(within(lobCard).getByText(teamName)).toBeInTheDocument();
    });

    // Verify caseVolume for "Inhouse" team under "US Chat"
    const targetTeamName: TeamName = "Inhouse";
    const lobEntry = initialMockRawCapacityData.find(
      entry => entry.bu === wfsBuName && entry.lob === usChatLobName
    );

    let expectedCaseVolumeInhouse = 0;
    if (lobEntry) {
      const teamRawEntry = lobEntry.teams.find(t => t.teamName === targetTeamName);
      if (teamRawEntry) {
        Object.entries(lobEntry.lobVolumeForecast || {}).forEach(([periodKey, lobVol]) => {
          const teamPeriodicInputForVol = teamRawEntry.periodicInputData[periodKey];
          if (lobVol && teamPeriodicInputForVol?.volumeMixPercentage) {
            expectedCaseVolumeInhouse += lobVol * (teamPeriodicInputForVol.volumeMixPercentage / 100);
          }
        });
      }
    }
    expectedCaseVolumeInhouse = Math.round(expectedCaseVolumeInhouse);

    // Find the table cell corresponding to Inhouse team's volume
    // It will be in a <td> next to the <td> containing "Inhouse"
    const inhouseTeamCell = within(lobCard).getByText(targetTeamName);
    const tableRow = inhouseTeamCell.closest('tr');
    expect(tableRow).toBeInTheDocument();
    if(!tableRow) throw new Error("Table row for Inhouse team not found");

    // The volume is the next cell in the row typically
    const cells = within(tableRow).getAllByRole('cell'); // gets all <td> or <th> in the row
    // Assuming structure: Team Name | Case Volume | Over/Under HC
    // So cell[1] should be case volume.
    expect(cells[1]).toHaveTextContent(expectedCaseVolumeInhouse.toLocaleString());
  });
});

// Named export for Dashboard if it's not default
export { Dashboard };
