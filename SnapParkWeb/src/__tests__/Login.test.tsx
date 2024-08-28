import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, Mock } from "vitest";
import Login from "@/Routes/Auth/Login/Login";
import {
  EmailSignIn,
  sendPasswordReset,
} from "@/Reusable/Functions/authFunctions";
import * as reactRouterDom from "react-router-dom";

vi.mock("@/Reusable/Functions/authFunctions", () => ({
  EmailSignIn: vi.fn(), // Ensure this matches your import
  sendPasswordReset: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof reactRouterDom>("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(), // Mock only useNavigate
  };
});

describe("Login Component", () => {
  it("renders all elements correctly", async () => {
    render(
      <reactRouterDom.MemoryRouter>
        <Login />
      </reactRouterDom.MemoryRouter>,
    );

    expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Forgot Password?/i)).toBeInTheDocument();

    const signInButtons = await screen.findAllByText(/Sign in/i);
    signInButtons.forEach((button) => expect(button).toBeInTheDocument());
  });

  it("calls EmailSignIn with correct arguments and navigates to dashboard on successful login", async () => {
    const mockedNavigate = vi.fn();
    (reactRouterDom.useNavigate as Mock).mockReturnValue(mockedNavigate);

    const mockEmailSignIn = EmailSignIn as Mock;
    mockEmailSignIn.mockResolvedValue(true); // Mock successful sign-in

    render(
      <reactRouterDom.MemoryRouter>
        <Login />
      </reactRouterDom.MemoryRouter>,
    );

    // Simulate user input
    const emailInput = screen.getByLabelText(
      "Email address",
    ) as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockEmailSignIn).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
      );
      expect(mockedNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("displays an error message for an invalid email", async () => {
    render(
      <reactRouterDom.MemoryRouter>
        <Login />
      </reactRouterDom.MemoryRouter>,
    );

    // Simulate user input
    const emailInput = screen.getByLabelText(
      "Email address",
    ) as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await userEvent.type(emailInput, "test@example");
    await userEvent.type(passwordInput, "password123");
    await userEvent.click(submitButton);

    // Use waitFor to ensure we wait for the validation message to appear

    expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
  });

  it("displays an error message for wrong password", async () => {
    const mockEmailSignIn = EmailSignIn as Mock;
    mockEmailSignIn.mockRejectedValue({ code: "auth/wrong-password" }); // Mock wrong password error

    render(
      <reactRouterDom.MemoryRouter>
        <Login />
      </reactRouterDom.MemoryRouter>,
    );

    // Simulate user input
    const emailInput = screen.getByLabelText(
      "Email address",
    ) as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    await userEvent.click(submitButton);

    // Wait for the async function to resolve and check for error message
    await waitFor(() => {
      expect(screen.getByText(/Password is incorrect/i)).toBeInTheDocument();
    });
  });

  it("sends a password reset email", async () => {
    (sendPasswordReset as Mock).mockResolvedValue(true);

    render(
      <reactRouterDom.MemoryRouter>
        <Login />
      </reactRouterDom.MemoryRouter>,
    );

    const emailInput = screen.getByLabelText(/Email address/i);
    const resetLink = screen.getByText(/Forgot Password?/i);

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.click(resetLink);

    expect(await screen.findByText(/Sent!/i)).toBeInTheDocument();
  });

  it("displays an error if email is empty on password reset", async () => {
    render(
      <reactRouterDom.MemoryRouter>
        <Login />
      </reactRouterDom.MemoryRouter>,
    );

    const resetLink = screen.getByText(/Forgot Password?/i);

    await userEvent.click(resetLink);

    expect(
      await screen.findByText(/Please enter your email address/i),
    ).toBeInTheDocument();
  });
});
