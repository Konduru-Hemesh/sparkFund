import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  Share2,
  Eye,
  Star,
  DollarSign,
  Calendar,
  Tag,
  ArrowLeft,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { api } from "../services/api";
import Button from "../components/ui/Button";
import AIFloatingButton from "../components/ui/AIFloatingButton";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Modal from "../components/ui/Modal";
import toast from "react-hot-toast";

// ✅ Import your new Reviews Form
import CommentsReviewsForm from "../components/CommentsReviewsForm";

const IdeaDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [investmentTerms, setInvestmentTerms] = useState("");
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);

  const navigate = useNavigate();

  // Fetch idea details
  const { data: ideaData, isLoading } = useQuery(
    ["idea", id],
    () => api.ideas.getIdea(id),
    { enabled: !!id }
  );

  const idea = ideaData?.data?.idea;

  // Like idea mutation
  const likeMutation = useMutation(() => api.ideas.likeIdea(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(["idea", id]);
      toast.success("Idea liked!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to like idea");
    },
  });

  // Investment mutation
  const investmentMutation = useMutation(
    (data) => api.investors.makeInvestment(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["idea", id]);
        setShowInvestmentModal(false);
        setInvestmentAmount("");
        setInvestmentTerms("");
        toast.success("Investment made successfully!");
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Failed to make investment"
        );
      },
    }
  );

  // Collaboration request mutation
  const collaborationMutation = useMutation(
    () => api.ideas.requestCollaboration(id),
    {
      onSuccess: () => {
        toast.success("Collaboration request sent!");
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message ||
            "Failed to send collaboration request"
        );
      },
    }
  );

   // Add Comment/Review mutation
  const addReviewMutation = useMutation(
    (reviewData) => api.ideas.addComment(id, reviewData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["idea", id]);
        toast.success("Review added!");
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Failed to add review"
        );
      },
    }
  );

   // ✅ FIX: handleAddReview function
  const handleAddReview = (reviewData) => {
    addReviewMutation.mutate(reviewData);
  };

  const updateReviewMutation = useMutation(
  ({ commentId, data }) => api.ideas.updateComment(id, commentId, data),
  {
    onSuccess: () => {
      queryClient.invalidateQueries(["idea", id]);
      toast.success("Review updated!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Update failed"),
  }
);

const deleteReviewMutation = useMutation(
  (commentId) => api.ideas.deleteComment(id, commentId),
  {
    onSuccess: () => {
      queryClient.invalidateQueries(["idea", id]);
      toast.success("Review deleted!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Delete failed"),
  }
);

const handleUpdateReview = (commentId, data) =>
  updateReviewMutation.mutate({ commentId, data });

const handleDeleteReview = (commentId) =>
  deleteReviewMutation.mutate(commentId);


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStageColor = (stage) => {
    const colors = {
      idea: "bg-gray-100 text-gray-800",
      prototype: "bg-blue-100 text-blue-800",
      mvp: "bg-yellow-100 text-yellow-800",
      beta: "bg-orange-100 text-orange-800",
      launched: "bg-green-100 text-green-800",
    };
    return colors[stage] || "bg-gray-100 text-gray-800";
  };

  const handleLike = () => {
    likeMutation.mutate();
  };

  const isLiked = idea?.likes?.some((like) => like.user._id === user?._id);
  const fundingProgress = idea
    ? (idea.currentFunding / idea.fundingGoal) * 100
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Idea not found
          </h2>
          <p className="text-gray-600 mb-4">
            The idea you're looking for doesn't exist.
          </p>
          <Link to="/ideas">
            <Button>Back to Ideas</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/ideas"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Ideas
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Media */}
              <div className="h-64 bg-gradient-to-br from-primary-100 to-secondary-100 relative">
                {idea.videoUrl ? (
                  <video
                    src={idea.videoUrl}
                    poster={idea.thumbnailUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : idea.thumbnailUrl ? (
                  <img
                    src={idea.thumbnailUrl}
                    alt={idea.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="w-10 h-10 text-primary-600" />
                      </div>
                      <p className="text-primary-600 font-medium text-lg">
                        {idea.category}
                      </p>
                    </div>
                  </div>
                )}

                {/* Impact Score */}
                <div className="absolute top-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-2 flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-2" />
                    <span className="font-medium">
                      Impact Score: {idea.impactScore}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(
                          idea.stage
                        )}`}
                      >
                        {idea.stage}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {idea.category}
                      </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {idea.title}
                    </h1>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {idea.views} views
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(idea.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 mb-6">
                  <Button
                    variant={isLiked ? "primary" : "outline"}
                    onClick={handleLike}
                    loading={likeMutation.isLoading}
                  >
                    <Heart
                      className={`w-4 h-4 mr-2 ${
                        isLiked ? "fill-current" : ""
                      }`}
                    />
                    {idea.likes?.length || 0}
                  </Button>

                  <Button variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>

                  {user?.userType === "investor" &&
                    idea.creator &&
                    user._id !== idea.creator._id && (
                      <Button onClick={() => setShowInvestmentModal(true)}>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Invest
                      </Button>
                    )}

                  {user?.userType === "innovator" &&
                    idea.creator &&
                    user._id !== idea.creator._id && (
                      <Button
                        variant="outline"
                        onClick={() => collaborationMutation.mutate()}
                        loading={collaborationMutation.isLoading}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Collaborate
                      </Button>
                    )}
                </div>

                {/* Description */}
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {idea.description}
                  </p>
                </div>

                {/* Tags */}
                {idea.tags && idea.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {idea.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Reviews Section (integrated new form) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Reviews & Comments</h2>
            
            {/* Add Review Form */}
              <CommentsReviewsForm
                ideaId={id}
                onSubmit={handleAddReview}
                loading={addReviewMutation.isLoading}
              />

              {/* Existing Comments */}
              <div className="space-y-4 mt-6">
                {idea.comments?.length === 0 ? (
                  <p className="text-gray-500">No reviews yet. Be the first!</p>
                ) : (
                  idea.comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="p-4 border rounded-lg flex items-start gap-4"
                    >
                      <img
                        src={
                          comment.user?.profilePicture ||
                          "/default-avatar.png"
                        }
                        alt={comment.user?.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            {comment.user?.name}
                          </span>
                          <span className="text-yellow-500 text-sm">
                            ⭐ {comment.rating || 5}/5
                          </span>
                        </div>
                        <p className="text-gray-700 mt-1">{comment.content}</p>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>

                        {/* ✅ Show edit/delete only if current user is the author */}
                        {user?._id === comment.user?._id && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() =>
                                updateReviewMutation.mutate({
                                  commentId: comment._id,
                                  data: { content: "Updated content", rating: 4 }, // later replace with form input
                                })
                              }
                              className="text-blue-500 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteReviewMutation.mutate(comment._id)}
                              className="text-red-500 text-sm"
                            >
                              Delete
                            </button>
                      </div>
                        )}
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          </div>
          

          {/* Sidebar (Funding, Creator, Investors, etc.) */}
          <div className="space-y-6">
            {/* Funding Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Funding Progress
              </h3>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(idea.currentFunding)}
                  </span>
                  <span className="text-sm text-gray-500">
                    of {formatCurrency(idea.fundingGoal)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(100, fundingProgress)}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {Math.round(fundingProgress)}% funded •{" "}
                  {idea.investments?.length || 0} investors
                </div>
              </div>

              {user?.userType === "investor" &&
                user._id !== idea.creator._id && (
                  <Button
                    className="w-full"
                    onClick={() => setShowInvestmentModal(true)}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Invest Now
                  </Button>
                )}
            </div>

            {/* Creator Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Creator
              </h3>
              {idea.creator ? (
                <>
                  <div className="flex items-center mb-4">
                    <img
                      src={
                        idea.creator.profilePicture ||
                        `https://ui-avatars.com/api/?name=${idea.creator.name}&background=667eea&color=fff`
                      }
                      alt={idea.creator.name}
                      className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {idea.creator.name}
                      </h4>
                      {idea.creator.company && (
                        <p className="text-sm text-gray-600">
                          {idea.creator.company}
                        </p>
                      )}
                    </div>
                  </div>

                  {idea.creator.bio && (
                    <p className="text-sm text-gray-600 mb-4">
                      {idea.creator.bio}
                    </p>
                  )}

                  <Link to={`/profile/${idea.creator._id}`}>
                    <Button variant="outline" className="w-full">
                      View Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="text-gray-500">
                  Creator information not available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Investment Modal */}
        <Modal
          isOpen={showInvestmentModal}
          onClose={() => setShowInvestmentModal(false)}
          title="Make Investment"
          size="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (investmentAmount && parseFloat(investmentAmount) > 0) {
                investmentMutation.mutate({
                  amount: parseFloat(investmentAmount),
                  terms: investmentTerms,
                });
              }
            }}
            className="space-y-4"
          >
            <div>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Enter amount"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <textarea
              rows={3}
              placeholder="Investment terms (optional)"
              value={investmentTerms}
              onChange={(e) => setInvestmentTerms(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowInvestmentModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                loading={investmentMutation.isLoading}
                disabled={!investmentAmount || parseFloat(investmentAmount) <= 0}
              >
                Invest{" "}
                {investmentAmount &&
                  formatCurrency(parseFloat(investmentAmount))}
              </Button>
            </div>
          </form>
        </Modal>
      </div>

      {/* Floating Ask AI Button */}
      <AIFloatingButton />
    </div>
  );
};

export default IdeaDetailPage;
