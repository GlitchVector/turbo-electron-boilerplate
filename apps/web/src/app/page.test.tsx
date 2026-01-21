import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home page", () => {
  it("should render the home page with app name", () => {
    render(<Home />);
    expect(screen.getByText(/Turbo Electron App/i)).toBeInTheDocument();
  });

  it("should show bridge demo section", () => {
    render(<Home />);
    expect(screen.getByText(/Bridge Demo/i)).toBeInTheDocument();
  });
});
