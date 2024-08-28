import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { vi, Mock } from "vitest";
import { User, onAuthStateChanged, getAuth } from "firebase/auth";
import * as firebaseAuth from "firebase/auth"; // Import everything from firebase/auth

import { TestWrapper } from "./TestWrapper";
import routerConfig from "../routerConfig";

// Mock the firebase/auth module
vi.mock("firebase/auth", async (importOriginal) => {
  const actual = (await importOriginal()) as typeof firebaseAuth; // Explicitly type the import

  return {
    ...actual,
    onAuthStateChanged: vi.fn(),
    getAuth: () => actual.getAuth(), // Ensure getAuth is returned as part of the mock
  };
});

describe("PrivateRoute Component", () => {
  beforeEach(() => {
    // Mock the onAuthStateChanged to simulate a signed-in user
    (onAuthStateChanged as Mock).mockImplementation((auth, callback) => {
      callback({ uid: "test-user" } as User); // Simulate a user being returned
      return () => {}; // Mock unsubscribe function
    });
  });

  it("renders the Dashboard home page when signed in", async () => {
    const router = createMemoryRouter(routerConfig, {
      initialEntries: ["/dashboard"],
    });

    render(
      <TestWrapper>
        <RouterProvider router={router} />
      </TestWrapper>,
    );

    // Check that the Dashboard page is rendered
    expect(await screen.findByText(/Dashboard/i)).toBeInTheDocument();
    expect(await screen.findByText(/Billing/i)).toBeInTheDocument();
    expect(await screen.findByText(/Settings/i)).toBeInTheDocument();
  });

  it("renders the Employees page when navigating to /dashboard/employees", async () => {
    const router = createMemoryRouter(routerConfig, {
      initialEntries: ["/dashboard/employees"],
    });

    render(
      <TestWrapper>
        <RouterProvider router={router} />
      </TestWrapper>,
    );

    // Check that the Employees page is rendered
    expect(await screen.findByText(/Employees/i)).toBeInTheDocument();
  });

  it("renders the ParkingSpots page when navigating to /dashboard/parkingspots", async () => {
    const router = createMemoryRouter(routerConfig, {
      initialEntries: ["/dashboard/parkingspots"],
    });

    render(
      <TestWrapper>
        <RouterProvider router={router} />
      </TestWrapper>,
    );

    // Check that the ParkingSpots page is rendered
    expect(await screen.findByText(/ParkingSpots/i)).toBeInTheDocument();
  });

  it("renders the Billing page when navigating to /dashboard/billing", async () => {
    const router = createMemoryRouter(routerConfig, {
      initialEntries: ["/dashboard/billing"],
    });

    render(
      <TestWrapper>
        <RouterProvider router={router} />
      </TestWrapper>,
    );

    // Check that the Billing page is rendered
    expect(await screen.findByText(/Account/i)).toBeInTheDocument();
    expect(await screen.findByText(/Total Usage/i)).toBeInTheDocument();
    expect(await screen.findByText(/Monthly Usage/i)).toBeInTheDocument();
    expect(await screen.findByText(/Usage by Day/i)).toBeInTheDocument();
    expect(await screen.findByText(/Invoices/i)).toBeInTheDocument();
    expect(await screen.findByText(/Payment Method/i)).toBeInTheDocument();
  });

  it("renders the Settings page when navigating to /dashboard/settings", async () => {
    const router = createMemoryRouter(routerConfig, {
      initialEntries: ["/dashboard/settings"],
    });

    render(
      <TestWrapper>
        <RouterProvider router={router} />
      </TestWrapper>,
    );

    // Check that the Settings page is rendered
    expect(await screen.findByText(/Profile Information/i)).toBeInTheDocument();
    expect(await screen.findByText(/Billing Address/i)).toBeInTheDocument();
  });

  it("renders the QRCodeStickers page when navigating to /dashboard/stickers", async () => {
    const router = createMemoryRouter(routerConfig, {
      initialEntries: ["/dashboard/stickers"],
    });

    render(
      <TestWrapper>
        <RouterProvider router={router} />
      </TestWrapper>,
    );

    // Check that the QRCodeStickers page is rendered
    expect(
      await screen.findByText(/Generate New QR Codes/i),
    ).toBeInTheDocument();
  });

  it("redirects to login when accessing dashboard while signed out", async () => {
    // Mock the onAuthStateChanged to simulate a signed-out user
    (onAuthStateChanged as Mock).mockImplementation((auth, callback) => {
      callback(null); // Simulate no user being returned
      return () => {}; // Mock unsubscribe function
    });

    const router = createMemoryRouter(routerConfig, {
      initialEntries: ["/dashboard"],
    });

    render(
      <TestWrapper>
        <RouterProvider router={router} />
      </TestWrapper>,
    );

    // Check that the Login page is rendered instead of the Dashboard
    expect(
      await screen.findByText(/Sign in to your account/i),
    ).toBeInTheDocument();
  });
});
