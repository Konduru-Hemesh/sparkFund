import React, { Component } from "react";
import Button from "./ui/Button";

class CommentsReviewsForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: props.initialComment?.content || "",
      rating: props.initialComment?.rating || 5,
      isEditing: !!props.initialComment,

      // New fields
      name: "",
      age: "",
      email: "",
      password: "",
      agreeTerms: false,
      skills: [], // checkboxes
      gender: "male", // radio
      file: null,
      date: "",
      range: 5,
      color: "#000000",
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { content, rating, isEditing } = this.state;
    const { onSubmit, onUpdate, initialComment } = this.props;

    if (!content.trim()) return;

    if (isEditing) {
      onUpdate(initialComment._id, { ...this.state });
    } else {
      onSubmit({ ...this.state });
      this.setState({
        content: "",
        rating: 5,
        name: "",
        age: "",
        email: "",
        password: "",
        agreeTerms: false,
        skills: [],
        gender: "male",
        file: null,
        date: "",
        range: 5,
        color: "#000000",
      });
    }
  };

  handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox" && name === "skills") {
      this.setState((prev) => {
        const skills = prev.skills.includes(value)
          ? prev.skills.filter((s) => s !== value)
          : [...prev.skills, value];
        return { skills };
      });
    } else if (type === "checkbox") {
      this.setState({ [name]: checked });
    } else if (type === "file") {
      this.setState({ [name]: files[0] });
    } else {
      this.setState({ [name]: value });
    }
  };

  render() {
    const {
      content,
      rating,
      isEditing,
      name,
      age,
      email,
      password,
      agreeTerms,
      skills,
      gender,
      date,
      range,
      color,
    } = this.state;
    const { loading, onDelete, initialComment } = this.props;

    return (
      <form onSubmit={this.handleSubmit} className="space-y-4 p-4 border rounded-lg">
        {/* Textarea */}
        <textarea
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Write your review..."
          name="content"
          value={content}
          onChange={this.handleChange}
        />

        {/* Select (Rating) */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Rating:</label>
          <select
            name="rating"
            value={rating}
            onChange={this.handleChange}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num} ⭐
              </option>
            ))}
          </select>
        </div>

        {/* Input fields */}
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={name}
          onChange={this.handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        />
        <input
          type="number"
          name="age"
          placeholder="Your Age"
          value={age}
          onChange={this.handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={this.handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={this.handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        />

        {/* Checkboxes */}
        <div>
          <label className="block font-medium">Skills:</label>
          {["React", "Node.js", "MongoDB"].map((skill) => (
            <label key={skill} className="mr-4">
              <input
                type="checkbox"
                name="skills"
                value={skill}
                checked={skills.includes(skill)}
                onChange={this.handleChange}
              />
              {skill}
            </label>
          ))}
        </div>

        {/* Radio buttons */}
        <div>
          <label className="block font-medium">Gender:</label>
          {["male", "female", "other"].map((g) => (
            <label key={g} className="mr-4">
              <input
                type="radio"
                name="gender"
                value={g}
                checked={gender === g}
                onChange={this.handleChange}
              />
              {g}
            </label>
          ))}
        </div>

        {/* File upload */}
        <input type="file" name="file" onChange={this.handleChange} />

        {/* Date picker */}
        <input
          type="date"
          name="date"
          value={date}
          onChange={this.handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        />

        {/* Range slider */}
        <div>
          <label>Experience Level: {range}</label>
          <input
            type="range"
            name="range"
            min="1"
            max="10"
            value={range}
            onChange={this.handleChange}
          />
        </div>

        {/* Color picker */}
        <div>
          <label>Pick a Color:</label>
          <input
            type="color"
            name="color"
            value={color}
            onChange={this.handleChange}
          />
        </div>

        {/* Terms checkbox */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="agreeTerms"
            checked={agreeTerms}
            onChange={this.handleChange}
          />
          I agree to terms & conditions
        </label>

        {/* Buttons */}
        <div className="flex gap-2">
          <Button type="submit" loading={loading}>
            {isEditing ? "Update" : "Submit Review"}
          </Button>

          {isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onDelete(initialComment._id)}
            >
              Delete
            </Button>
          )}
        </div>
      </form>
    );
  }
}

export default CommentsReviewsForm;
