import 'package:equatable/equatable.dart';

class UserModel extends Equatable {
  final int id;
  final String email;
  final String firstName;
  final String lastName;
  final String userType;
  final String? phone;
  final String? profileImage;
  final bool isActive;
  final bool isVerified;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final ProfileModel? profile;

  const UserModel({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.userType,
    this.phone,
    this.profileImage,
    required this.isActive,
    required this.isVerified,
    required this.createdAt,
    this.updatedAt,
    this.profile,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as int,
      email: json['email'] as String,
      firstName: json['first_name'] as String,
      lastName: json['last_name'] as String,
      userType: json['user_type'] as String,
      phone: json['phone'] as String?,
      profileImage: json['profile_image'] as String?,
      isActive: json['is_active'] as bool? ?? true,
      isVerified: json['is_verified'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] != null 
          ? DateTime.parse(json['updated_at'] as String) 
          : null,
      profile: json['profile'] != null 
          ? ProfileModel.fromJson(json['profile'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'first_name': firstName,
      'last_name': lastName,
      'user_type': userType,
      'phone': phone,
      'profile_image': profileImage,
      'is_active': isActive,
      'is_verified': isVerified,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
      'profile': profile?.toJson(),
    };
  }

  UserModel copyWith({
    int? id,
    String? email,
    String? firstName,
    String? lastName,
    String? userType,
    String? phone,
    String? profileImage,
    bool? isActive,
    bool? isVerified,
    DateTime? createdAt,
    DateTime? updatedAt,
    ProfileModel? profile,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      userType: userType ?? this.userType,
      phone: phone ?? this.phone,
      profileImage: profileImage ?? this.profileImage,
      isActive: isActive ?? this.isActive,
      isVerified: isVerified ?? this.isVerified,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      profile: profile ?? this.profile,
    );
  }

  String get fullName => '$firstName $lastName';

  bool get isMercenary => userType.toLowerCase() == 'mercenary';
  bool get isOferente => userType.toLowerCase() == 'oferente';

  @override
  List<Object?> get props => [
        id,
        email,
        firstName,
        lastName,
        userType,
        phone,
        profileImage,
        isActive,
        isVerified,
        createdAt,
        updatedAt,
        profile,
      ];
}

class ProfileModel extends Equatable {
  final int id;
  final int userId;
  final String? bio;
  final String? location;
  final String? website;
  final List<String> skills;
  final double rating;
  final int completedJobs;
  final double totalEarnings;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const ProfileModel({
    required this.id,
    required this.userId,
    this.bio,
    this.location,
    this.website,
    required this.skills,
    required this.rating,
    required this.completedJobs,
    required this.totalEarnings,
    required this.createdAt,
    this.updatedAt,
  });

  factory ProfileModel.fromJson(Map<String, dynamic> json) {
    return ProfileModel(
      id: json['id'] as int,
      userId: json['user_id'] as int,
      bio: json['bio'] as String?,
      location: json['location'] as String?,
      website: json['website'] as String?,
      skills: (json['skills'] as List<dynamic>?)
          ?.map((skill) => skill.toString())
          .toList() ?? [],
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      completedJobs: json['completed_jobs'] as int? ?? 0,
      totalEarnings: (json['total_earnings'] as num?)?.toDouble() ?? 0.0,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] != null 
          ? DateTime.parse(json['updated_at'] as String) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'bio': bio,
      'location': location,
      'website': website,
      'skills': skills,
      'rating': rating,
      'completed_jobs': completedJobs,
      'total_earnings': totalEarnings,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  ProfileModel copyWith({
    int? id,
    int? userId,
    String? bio,
    String? location,
    String? website,
    List<String>? skills,
    double? rating,
    int? completedJobs,
    double? totalEarnings,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return ProfileModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      bio: bio ?? this.bio,
      location: location ?? this.location,
      website: website ?? this.website,
      skills: skills ?? this.skills,
      rating: rating ?? this.rating,
      completedJobs: completedJobs ?? this.completedJobs,
      totalEarnings: totalEarnings ?? this.totalEarnings,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        bio,
        location,
        website,
        skills,
        rating,
        completedJobs,
        totalEarnings,
        createdAt,
        updatedAt,
      ];
}
