/**
 * A custom interface to represent the user data decoded from the Keycloak token.
 * This interface defines the standard claims you can expect in a Keycloak JWT.
 */
export interface KeycloakProfile {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;

  // Keycloak roles are nested under realm_access and resource_access
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    // The key is the client_id
    [client_id: string]: {
      roles: string[];
    };
  };

  // You can add any other standard or custom claims you have configured
  [key: string]: any;
}
