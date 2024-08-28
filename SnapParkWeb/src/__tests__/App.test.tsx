import { render, screen, act } from "@testing-library/react";
import App from "../App";
import {
  MemoryRouter,
  createMemoryRouter,
  RouterProvider,
} from "react-router-dom";
import { TestWrapper } from "./TestWrapper";
import routerConfig from "@/routerConfig";

describe("App Component", () => {
  it("renders App without crashing", async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );
    });
  });

  describe("Landing Page", () => {
    it("renders the Navbar", async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <App />
          </TestWrapper>,
        );
      });

      const landingText = screen.getByText(/How it works/i);
      expect(landingText).toBeInTheDocument();
    });

    it("renders the Hero", async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <App />
          </TestWrapper>,
        );
      });

      const landingText = screen.getByText(
        /Sick of missing out on a park at work/i,
      );
      expect(landingText).toBeInTheDocument();
    });

    it("renders the Notifications Section", async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <App />
          </TestWrapper>,
        );
      });

      const landingText = screen.getByText(/Intelligent Notifications/i);
      expect(landingText).toBeInTheDocument();
    });

    it("renders the Sticker Section", async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <App />
          </TestWrapper>,
        );
      });

      const landingText = screen.getByText(/Snap Park QR Stickers/i);
      expect(landingText).toBeInTheDocument();
    });

    it("renders the Dashboard Section", async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <App />
          </TestWrapper>,
        );
      });

      const landingText = screen.getByText(/Efficient Parking Management/i);
      expect(landingText).toBeInTheDocument();
    });

    it("renders the SMS Pricing Section", async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <App />
          </TestWrapper>,
        );
      });

      const landingText = screen.getByText(/No up-front payment required/i);
      expect(landingText).toBeInTheDocument();
    });

    it("renders the App Pricing Section", async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <App />
          </TestWrapper>,
        );
      });

      const landingText = screen.getByText(/The new Snap Park App/i);
      expect(landingText).toBeInTheDocument();
    });

    it("renders the Marketing Section", async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <App />
          </TestWrapper>,
        );
      });

      const landingText = screen.getByText(/the App launches/i);
      expect(landingText).toBeInTheDocument();
    });

    it("renders the FAQ Section", async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <App />
          </TestWrapper>,
        );
      });

      const landingText = screen.getByText(/How do employees sign up/i);
      expect(landingText).toBeInTheDocument();
    });

    it("renders the Footer", async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <App />
          </TestWrapper>,
        );
      });

      const landingText = screen.getByText(/Subscribe to our newsletter/i);
      expect(landingText).toBeInTheDocument();
    });
  });

  describe("Routes", () => {
    it("renders the Login page on /login route", () => {
      // Create a memory router with the initial entry set to /login
      const router = createMemoryRouter(routerConfig, {
        initialEntries: ["/login"],
      });

      render(
        <TestWrapper>
          <RouterProvider router={router} />
        </TestWrapper>,
      );

      // Check that the Login page is rendered
      expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
    });

    it("renders the Register page on /register route", () => {
      // Create a memory router with the initial entry set to /login
      const router = createMemoryRouter(routerConfig, {
        initialEntries: ["/register"],
      });

      render(
        <TestWrapper>
          <RouterProvider router={router} />
        </TestWrapper>,
      );

      // Check that the Login page is rendered
      expect(screen.getByText(/Create a new account/i)).toBeInTheDocument();
    });

    it("renders the Contact page on /contact route", () => {
      // Create a memory router with the initial entry set to /login
      const router = createMemoryRouter(routerConfig, {
        initialEntries: ["/contact"],
      });

      render(
        <TestWrapper>
          <RouterProvider router={router} />
        </TestWrapper>,
      );

      // Check that the Login page is rendered
      expect(screen.getByText(/Get in touch/i)).toBeInTheDocument();
    });

    it("renders the ToS page on /terms-and-conditions route", () => {
      // Create a memory router with the initial entry set to /login
      const router = createMemoryRouter(routerConfig, {
        initialEntries: ["/terms-and-conditions"],
      });

      render(
        <TestWrapper>
          <RouterProvider router={router} />
        </TestWrapper>,
      );

      expect(screen.getByText(/TERMS OF SERVICE/i)).toBeInTheDocument();
    });

    it("renders the Privacy Policy on /privacy-policy route", () => {
      // Create a memory router with the initial entry set to /login
      const router = createMemoryRouter(routerConfig, {
        initialEntries: ["/privacy-policy"],
      });

      render(
        <TestWrapper>
          <RouterProvider router={router} />
        </TestWrapper>,
      );

      expect(screen.getByText(/PRIVACY POLICY/i)).toBeInTheDocument();
    });

    it("renders the NotFound page on an unknown route", () => {
      // Create a memory router with the initial entry set to an unknown route
      const router = createMemoryRouter(routerConfig, {
        initialEntries: ["/unknown-route"],
      });

      render(
        <TestWrapper>
          <RouterProvider router={router} />
        </TestWrapper>,
      );

      // Check that the NotFound page is rendered
      expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
    });
  });
});

// it("renders the NotFound component for an unknown route", () => {
//   // Simulate navigation to an unknown route by updating the browser's history
//   window.history.pushState({}, "Test page", "/sdsdsds");

//   render(
//     <TestWrapper>
//       <App />
//     </TestWrapper>,
//   );

//   // Check if the NotFound component's text is rendered
//   const notFoundText = screen.getByText(/wheel/i);
//   expect(notFoundText).toBeInTheDocument();
// });
