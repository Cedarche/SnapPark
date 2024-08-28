import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, Mock } from "vitest";
import Register from "@/Routes/Auth/Register/Register"; // Adjust the path if needed
import { SignUp } from "@/Reusable/Functions/authFunctions";
import * as reactRouterDom from "react-router-dom";

vi.mock("@/Reusable/Functions/authFunctions", () => ({
  SignUp: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof reactRouterDom>("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe("Register Component", () => {
  it("renders all elements correctly", async () => {
    render(
      <reactRouterDom.MemoryRouter>
        <Register />
      </reactRouterDom.MemoryRouter>,
    );

    // Check if input fields and button are rendered
    expect(screen.getByText(/Create a new account/i)).toBeInTheDocument();
    expect(screen.getByText(/Privacy/i)).toBeInTheDocument();
    expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByTestId(/confirm/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirm Password/i)).toBeInTheDocument();

    const registerButton = await screen.findByRole("button", {
      name: /Create account/i,
    });
    expect(registerButton).toBeInTheDocument();

    // Check if the logo is rendered
    const logo = screen.getByAltText("Snap Park Logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute(
      "src",
      expect.stringContaining("SnapParkLogo"),
    );
  });

  it("calls SignUp with correct arguments and navigates to dashboard on successful registration", async () => {
    const mockedNavigate = vi.fn();
    (reactRouterDom.useNavigate as Mock).mockReturnValue(mockedNavigate);

    const mockSignUp = SignUp as Mock;
    mockSignUp.mockResolvedValue(true); // Mock successful registration

    render(
      <reactRouterDom.MemoryRouter>
        <Register />
      </reactRouterDom.MemoryRouter>,
    );

    // Simulate user input
    const emailInput = screen.getByLabelText(
      "Email address",
    ) as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText(
      "Confirm Password",
    ) as HTMLInputElement;
    const companyInput = screen.getByLabelText(
      "Company name",
    ) as HTMLInputElement;
    const registerButton = screen.getByRole("button", {
      name: /Create account/i,
    });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "Password123");
    await userEvent.type(confirmPasswordInput, "Password123");
    await userEvent.type(companyInput, "Test Company");

    await userEvent.click(registerButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        "test@example.com",
        "Password123",
        "Test Company",
      );
      expect(mockedNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("displays an error message for an invalid email", async () => {
    render(
      <reactRouterDom.MemoryRouter>
        <Register />
      </reactRouterDom.MemoryRouter>,
    );

    // Simulate user input
    const emailInput = screen.getByLabelText(
      "Email address",
    ) as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText(
      "Confirm Password",
    ) as HTMLInputElement;
    const companyInput = screen.getByLabelText(
      "Company name",
    ) as HTMLInputElement;
    const registerButton = screen.getByRole("button", {
      name: /Create account/i,
    });

    await userEvent.type(emailInput, "test@example");
    await userEvent.type(passwordInput, "Password123");
    await userEvent.type(confirmPasswordInput, "Password123");
    await userEvent.type(companyInput, "Test Company");

    await userEvent.click(registerButton);

    expect(
      screen.getByText(/Please enter a valid email address/i),
    ).toBeInTheDocument();
  });

  it("displays an error message when passwords do not match", async () => {
    render(
      <reactRouterDom.MemoryRouter>
        <Register />
      </reactRouterDom.MemoryRouter>,
    );

    // Simulate user input
    const emailInput = screen.getByLabelText(
      "Email address",
    ) as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText(
      "Confirm Password",
    ) as HTMLInputElement;
    const companyInput = screen.getByLabelText(
      "Company name",
    ) as HTMLInputElement;
    const registerButton = screen.getByRole("button", {
      name: /Create account/i,
    });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "Password123");
    await userEvent.type(confirmPasswordInput, "Password");
    await userEvent.type(companyInput, "Test Company");

    await userEvent.click(registerButton);

    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  it("displays an error message when the email is already in use", async () => {
    const mockSignUp = SignUp as Mock;
    mockSignUp.mockRejectedValue({ code: "auth/email-already-in-use" });

    render(
      <reactRouterDom.MemoryRouter>
        <Register />
      </reactRouterDom.MemoryRouter>,
    );

    // Simulate user input
    const emailInput = screen.getByLabelText(
      "Email address",
    ) as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText(
      "Confirm Password",
    ) as HTMLInputElement;
    const companyInput = screen.getByLabelText(
      "Company name",
    ) as HTMLInputElement;
    const registerButton = screen.getByRole("button", {
      name: /Create account/i,
    });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "Password123");
    await userEvent.type(confirmPasswordInput, "Password123");
    await userEvent.type(companyInput, "Test Company");

    await userEvent.click(registerButton);

    await waitFor(() => {
      expect(
        screen.getByText(/The email address is already in use/i),
      ).toBeInTheDocument();
    });
  });

  it("displays an error message when the company name is already in use", async () => {
    const mockSignUp = SignUp as Mock;
    mockSignUp.mockRejectedValue(new Error("Error: alreadyExistsError"));

    render(
      <reactRouterDom.MemoryRouter>
        <Register />
      </reactRouterDom.MemoryRouter>,
    );

    // Simulate user input
    const emailInput = screen.getByLabelText(
      "Email address",
    ) as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText(
      "Confirm Password",
    ) as HTMLInputElement;
    const companyInput = screen.getByLabelText(
      "Company name",
    ) as HTMLInputElement;
    const registerButton = screen.getByRole("button", {
      name: /Create account/i,
    });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "Password123");
    await userEvent.type(confirmPasswordInput, "Password123");
    await userEvent.type(companyInput, "Test Company");

    await userEvent.click(registerButton);

    await waitFor(() => {
      expect(
        screen.getByText(/The company name is already in use/i),
      ).toBeInTheDocument();
    });
  });
});
