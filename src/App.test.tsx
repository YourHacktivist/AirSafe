import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";

test("renders AirSafe application", () => {
  const { getByText } = render(<App />);
  const titleElement = getByText(/AirSafe/i);
  expect(titleElement).toBeInTheDocument();
});

test("renders welcome screen initially", () => {
  const { getByText } = render(<App />);
  const welcomeText = getByText(/Détectez les caméras cachées/i);
  expect(welcomeText).toBeInTheDocument();
});

test("renders analyze button", () => {
  const { getByText } = render(<App />);
  const analyzeButton = getByText(/Analyser mon réseau/i);
  expect(analyzeButton).toBeInTheDocument();
});
